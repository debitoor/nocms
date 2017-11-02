import {fork} from 'child_process';
import {createDebug} from './debug';

const debug = createDebug('threading');

export const IDLE = 'IDLE';
export const BUSY = 'BUSY';

export async function createCommandWorkerProcess (id, moduleName, args) {
	debug('createCommandWorkerProcess(%d, %s, %o)', id, moduleName, args);

	moduleName = moduleName || process.argv[1];
	args = args || process.argv.slice(3);

	let childPromise;
	const commandPromises = {};
	const child = fork(moduleName, args);
	child.id = id;
	child.idle = idle;
	child.busy = busy;
	child.sendCommand = sendCommand;
	child.on('message', handleMessage);
	child.on('error', handleError);
	child.on('exit', handleExit);

	return new Promise((resolve, reject) => childPromise = {resolve, reject});

	function handleError (err) {
		debug('commandWorkerProcess.%d.handleError(%o)', id, err);

		throw err;
	}

	function handleExit (code) {
		debug('commandWorkerProcess.%d.handleError(%d)', id, code);

		if (code) {
			throw new Error(`commandWorkerProcess.${id} exited with non zero code: ${code}`);
		}
	}

	function handleMessage (message) {
		debug('commandWorkerProcess.%d.handleMessage(%o)', id, message);

		switch (message.topic) {
			case 'busy':
				busy();
				break;

			case 'idle':
				idle();
				break;

			case 'ready':
				ready();
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
		debug('commandWorkerProcess.%d.idle', id);
		child.state = IDLE;
		child.emit('idle');
	}

	function busy() {
		debug('commandWorkerProcess.%d.busy', id);
		child.state = BUSY;
		child.emit('busy');
	}

	function ready() {
		debug('commandWorkerProcess.%d.ready', id);
		childPromise.resolve(child);
	}

	async function sendCommand (command) {
		debug('commandWorkerProcess.%d.sendCommand', id);
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
			})
			.catch(err => {
				idle();
				throw err;
			});
	}
}

export async function createCommandWorkerProcessPool (size, moduleName, args) {
	debug('createCommandWorkerProcessPool(%d, %s, %o)', size, moduleName, args);

	const promises = [];
	const commandWorkerProcesses = await Promise.all(Array.apply(null, { length: size })
		.map((value, id) => createCommandWorkerProcess(id, moduleName, args))
	);

	const idleCommandWorkerProcesses = [];

	process.on('exit', code => {
		debug('process.on(exit, %d)', code);

		commandWorkerProcesses.forEach(commandWorkerProcess => commandWorkerProcess.kill());
	});

	process.on('SIGINT', () => {
		debug('process.on(SIGINT)');

		process.exit(1);
	});

	process.on('SIGTERM', () => {
		debug('process.on(SIGTERM)');

		process.exit(1);
	});

	commandWorkerProcesses.forEach(commandWorkerProcess => {
		commandWorkerProcess.on('idle', () => {
			debug('commandWorkerProcess.%d.on(%s)', commandWorkerProcess.id, 'idle');

			idleCommandWorkerProcesses.push(commandWorkerProcess);

			const promise = promises.shift();

			if (promise) {
				const nextIdleCommandWorkerProcess = idleCommandWorkerProcesses.shift();

				promise.resolve(nextIdleCommandWorkerProcess);
			}
		});

		commandWorkerProcess.on('busy', () => {
			debug('commandWorkerProcess.%d.on(%s)', commandWorkerProcess.id, 'busy');

			const indexOfCommandWorkerProcess = idleCommandWorkerProcesses.indexOf(commandWorkerProcess);

			if (indexOfCommandWorkerProcess > -1) {
				idleCommandWorkerProcesses.splice(indexOfCommandWorkerProcess, 1);
			}
		});
	});

	async function getFirstIdleCommandWorkerProcess () {
		debug('getFirstIdleCommandWorkerProcess()');

		const firstIdleWorkerProcess = idleCommandWorkerProcesses.shift();

		if (firstIdleWorkerProcess) {
			firstIdleWorkerProcess.busy();

			return Promise.resolve(firstIdleWorkerProcess);
		}

		return new Promise((resolve, reject) => promises.push({resolve, reject}));
	}

	async function getAllCommandWorkerProcesses () {
		debug('getAllCommandWorkerProcesses()');
		
		return commandWorkerProcesses;
	}

	return {getFirstIdleCommandWorkerProcess, getAllCommandWorkerProcesses};
}

// Send a command
export function createCommandSender (commandWorkerProcessPool) {
	debug('createCommandSender()');

	let commandSender = {sendCommand, sendCommandAll};

	commandWorkerProcessPool = commandWorkerProcessPool || createCommandWorkerProcessPool();

	async function sendCommand (command) {
		debug('commandSender.sendCommand(%o)',command);

		const commandWorkerProcess = await commandWorkerProcessPool.getFirstIdleCommandWorkerProcess();

		return commandWorkerProcess.sendCommand(command);
	}

	async function sendCommandAll (command) {
		debug('commandSender.sendCommand(%o)',command);

		const commandWorkerProcesses = await commandWorkerProcessPool.getAllCommandWorkerProcesses();

		return Promise.all(commandWorkerProcesses.map(commandWorkerProcess => commandWorkerProcess.sendCommand(command)));
	}

	return commandSender;
}

// Listens for process message and calls the command dispatcher when it receives a command;
export function createCommandReceiver (commandDispatcher) {
	debug('createCommandReceiver()');

	process.on('message', handleMessage);

	return {busy, idle, ready};

	function handleMessage (message) {
		debug('commandReceiver.handleMessage(%o)', message);

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
					})
					.catch(err => {
						let message = {
							topic: 'commandNotHandled',
							data: {
								commandId: command.id,
								command: command,
								message: err.message,
								stack: err.stack
							}
						};

						process.send(message);
					});
				break;
		}
	}

	function busy () {
		debug('commandReceiver.busy()');
		process.send({topic: 'busy'});
	}

	function idle () {
		debug('commandReceiver.idle()');
		process.send({topic: 'idle'});
	}

	function ready () {
		debug('commandReceiver.ready()');
		process.send({topic: 'ready'});
	}
}

// Creates a CommandDispatcher that Dispatches Commands to a CommandHandlers
export function createCommandDispatcher (commandHandlers) {
	debug('createCommandDispatcher()');

	async function dispatchCommand (command) {
		let commandHandler = commandHandlers.filter(commandHandler => commandHandler.canHandleCommand(command.type))[0];

		if (!commandHandler) {
			throw new CommandHandlerNotFoundError(command);
		}

		return commandHandler.handleCommand(command);
	}

	return { dispatchCommand };
}

// Creates a CommandHandler that Handles Command
export function createCommandHandler (commandTypes, _handleCommand) {
	debug('createCommandHandler()');

	async function handleCommand (command) {
		return _handleCommand(command);
	}

	function canHandleCommand(commandType) {
		return commandTypes.includes(commandType);
	}

	return { handleCommand, canHandleCommand };
}

class ErrorWithCode extends Error {
	constructor(message, code) {
		super(message);
		this.code = code;
	}
}

class CommandHandlerNotFoundError extends ErrorWithCode {
	constructor(command) {
		super(`Command Handler Not Found for Command of Type ${command.type}`, 'COMMAND_HANDLER_NOT_FOUND');
		this.command = command;
	}
}
