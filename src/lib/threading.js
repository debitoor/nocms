import {cpus} from 'os';
import {fork} from 'child_process';

export const IDLE = 'IDLE';
export const BUSY = 'BUSY';

export function createCommandWorkerProcess (id) {
	const commandPromises = {};
	const moduleName = process.argv[1];
	const args = ['worker', ...process.argv.slice(3,7), {slient: true}];
	const child = fork(moduleName, args);
	child.id = id;
	child.idle = idle;
	child.busy = busy;
	child.sendCommand = sendCommand;
	child.on('message', handleMessage);
	child.on('error', handleError);
	child.on('exit', handleExit);

	return child;

	function handleError (err) {
		console.error('err', id, err);
	}

	function handleExit (exit) {
		console.log('exit', id, exit);
	}

	function handleMessage (message) {
		switch (message.topic) {
			case 'busy':
				busy();
				break;

			case 'idle':
				idle();
				break;

			case 'commandHandled':
				(() => {
					let commandId = message.data.commandId;
					let commandPromise = commandPromises[commandId];
					delete commandPromise[commandId];
					commandPromise.resolve(message.data);
				})();
				break;

			case 'commandNotHandled':
				(() => {
					let commandId = message.data.commandId;
					let commandPromise = commandPromises[commandId];
					delete commandPromise[commandId];
					commandPromise.reject(message.data);
				})();
				break;
		}
	}

	function idle() {
		child.state = IDLE;
		child.emit('idle');
	}

	function busy() {
		child.state = BUSY;
		child.emit('busy');
	}

	async function sendCommand (command) {
		busy();

		let message = {
			topic: 'handleCommand',
			data: command
		};

		child.send(message);

		return new Promise((resolve, reject) => commandPromises[command.id] = {resolve, reject})
			.then(result => {
				idle();
				return result;
			});
	}
}

export function createCommandWorkerProcessPool (size) {
	size = size || cpus().length;
	const promises = [];
	const commandWorkerProcesses = Array.apply(null, { length: size }).map((value, idx) => createCommandWorkerProcess(idx));
	const idleCommandWorkerProcesses = [];

	commandWorkerProcesses.forEach(commandWorkerProcess => {
		commandWorkerProcess.on('idle', () => {
			idleCommandWorkerProcesses.push(commandWorkerProcess);

			let promise = promises.shift();

			if (promise) {
				let nextIdleCommandWorkerProcess = idleCommandWorkerProcesses.shift();

				promise.resolve(nextIdleCommandWorkerProcess);
			}
		});
	});

	async function getFirstIdleCommandWorkerProcess () {
		let firstIdleWorkerProcess = idleCommandWorkerProcesses.shift();

		if (firstIdleWorkerProcess) {
				firstIdleWorkerProcess.busy();

				return Promise.resolve(firstIdleWorkerProcess);
		}

		return new Promise((resolve, reject) => promises.push({resolve, reject}));
	}

	return {getFirstIdleCommandWorkerProcess};
}

// Send a command
export function createCommandSender (commandWorkerProcessPool) {
	commandWorkerProcessPool = commandWorkerProcessPool || createCommandWorkerProcessPool();
	async function sendCommand (command) {
		try {
			let commandWorkerProcess = await commandWorkerProcessPool.getFirstIdleCommandWorkerProcess();

			return commandWorkerProcess.sendCommand(command);
		} catch (err) {
			throw err;
		}
	}

	return {sendCommand};
}

// Listens for process message and calls the command dispatcher when it receives a command;
export function createCommandReceiver (commandDispatcher) {
		process.on('message', handleMessage);

		return {busy, idle};

		function handleMessage (message) {
			switch (message.topic) {
				case 'handleCommand':
					let command = message.data;

					commandDispatcher.dispatchCommand(command)
						.then(result => {
							let message = {
								topic: 'commandHandled',
								data: {
									commandId: command.id,
									result
								}
							};

							process.send(message);
						}, err => {
							let message = {
								topic: 'commandNotHandled',
								data: {
									commandId: command.id,
									err: {
										message: err.message,
										stack: err.stack
									}
								}
							};

							process.send(message);

							throw err;
						});
					break;
			}
		}

		function busy () {
			process.send({topic: 'busy'});
		}

		function idle () {
			process.send({topic: 'idle'});
		}
}

// Creates a CommandDispatcher that Dispatches Commands to a CommandHandlers
export function createCommandDispatcher (commandHandlers) {
	async function dispatchCommand (command) {
		let commandHandler = commandHandlers.filter(commandHandler => commandHandler.canHandleCommand(command.name))[0];

		if (!commandHandler) {
			throw new Error('Command Handler Not Found');
		}

		return commandHandler.handleCommand(command);
	}

	return {dispatchCommand};
}

// Creates a CommandHandler that Handles Command
export function createCommandHandler (commandNames, _handleCommand) {
	async function handleCommand (command) {
		return _handleCommand(command);
	}

	function canHandleCommand(commandName) {
		return commandNames.includes(commandName);
	}

	return {handleCommand,canHandleCommand};
}