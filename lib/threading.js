'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.BUSY = exports.IDLE = undefined;
exports.createCommandWorkerProcess = createCommandWorkerProcess;
exports.createCommandWorkerProcessPool = createCommandWorkerProcessPool;
exports.createCommandSender = createCommandSender;
exports.createCommandReceiver = createCommandReceiver;
exports.createCommandDispatcher = createCommandDispatcher;
exports.createCommandHandler = createCommandHandler;

var _child_process = require('child_process');

var _debug = require('./debug');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug.createDebug)('threading');

const IDLE = exports.IDLE = 'IDLE';
const BUSY = exports.BUSY = 'BUSY';

function createCommandWorkerProcess(id, moduleName, args) {
	let sendCommand = (() => {
		var _ref = _asyncToGenerator(function* (command) {
			debug('commandWorkerProcess.%d.sendCommand: %o', id, command);
			busy();

			let message = {
				topic: 'handleCommand',
				data: command
			};

			child.send(message);

			return new Promise(function (resolve, reject) {
				return commandPromises[command.id] = { resolve, reject };
			}).then(function (result) {
				idle();
				return result;
			}).catch(function (err) {
				idle();
				throw err;
			});
		});

		return function sendCommand(_x) {
			return _ref.apply(this, arguments);
		};
	})();

	debug('createCommandWorkerProcess(%d, %s, %o)', id, moduleName, args);

	moduleName = moduleName || process.argv[1];
	args = args || process.argv.slice(3);

	const commandPromises = {};
	const child = (0, _child_process.fork)(moduleName, args);
	child.id = id;
	child.idle = idle;
	child.busy = busy;
	child.sendCommand = sendCommand;
	child.on('message', handleMessage);
	child.on('error', handleError);
	child.on('exit', handleExit);

	return child;

	function handleError(err) {
		debug('commandWorkerProcess.%d.handleError(%o)', id, err);
		busy();
	}

	function handleExit(exit) {
		debug('commandWorkerProcess.%d.handleError(%o)', id, exit);
		busy();
	}

	function handleMessage(message) {
		debug('commandWorkerProcess.%d.handleMessage(%o)', id, message);
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
		debug('commandWorkerProcess.%d.idle', id);
		child.state = IDLE;
		child.emit('idle');
	}

	function busy() {
		debug('commandWorkerProcess.%d.busy', id);
		child.state = BUSY;
		child.emit('busy');
	}
}

function createCommandWorkerProcessPool(size, moduleName, args) {
	let getFirstIdleCommandWorkerProcess = (() => {
		var _ref2 = _asyncToGenerator(function* () {
			debug('getFirstIdleCommandWorkerProcess()');

			const firstIdleWorkerProcess = idleCommandWorkerProcesses.shift();

			if (firstIdleWorkerProcess) {
				firstIdleWorkerProcess.busy();

				return Promise.resolve(firstIdleWorkerProcess);
			}

			return new Promise(function (resolve, reject) {
				return promises.push({ resolve, reject });
			});
		});

		return function getFirstIdleCommandWorkerProcess() {
			return _ref2.apply(this, arguments);
		};
	})();

	debug('createCommandWorkerProcessPool(%d, %s, %o)', size, moduleName, args);
	const promises = [];
	const commandWorkerProcesses = Array.apply(null, { length: size }).map((value, id) => createCommandWorkerProcess(id, moduleName, args));
	const idleCommandWorkerProcesses = [];

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

	return { getFirstIdleCommandWorkerProcess };
}

// Send a command
function createCommandSender(commandWorkerProcessPool) {
	let sendCommand = (() => {
		var _ref3 = _asyncToGenerator(function* (command) {
			debug('commandSender.sendCommand(%o)', command);

			try {

				let commandWorkerProcess = yield commandWorkerProcessPool.getFirstIdleCommandWorkerProcess();

				return commandWorkerProcess.sendCommand(command);
			} catch (err) {
				throw err;
			}
		});

		return function sendCommand(_x2) {
			return _ref3.apply(this, arguments);
		};
	})();

	debug('createCommandSender()');

	let commandSender = { sendCommand };

	commandWorkerProcessPool = commandWorkerProcessPool || createCommandWorkerProcessPool();

	return commandSender;
}

// Listens for process message and calls the command dispatcher when it receives a command;
function createCommandReceiver(commandDispatcher) {
	debug('createCommandReceiver()');

	process.on('message', handleMessage);

	return { busy, idle };

	function handleMessage(message) {
		debug('commandReceiver.handleMessage(%o)', message);

		switch (message.topic) {
			case 'handleCommand':
				let command = message.data;

				commandDispatcher.dispatchCommand(command).then(result => {
					let message = {
						topic: 'commandHandled',
						data: {
							commandId: command.id,
							result
						}
					};

					process.send(message);
				}).catch(err => {
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
				});
				break;
		}
	}

	function busy() {
		debug('commandReceiver.busy()');
		process.send({ topic: 'busy' });
	}

	function idle() {
		debug('commandReceiver.idle()');
		process.send({ topic: 'idle' });
	}
}

// Creates a CommandDispatcher that Dispatches Commands to a CommandHandlers
function createCommandDispatcher(commandHandlers) {
	let dispatchCommand = (() => {
		var _ref4 = _asyncToGenerator(function* (command) {
			let commandHandler = commandHandlers.filter(function (commandHandler) {
				return commandHandler.canHandleCommand(command.name);
			})[0];

			if (!commandHandler) {
				throw new Error('Command Handler Not Found');
			}

			return commandHandler.handleCommand(command);
		});

		return function dispatchCommand(_x3) {
			return _ref4.apply(this, arguments);
		};
	})();

	debug('createCommandDispatcher()');

	return { dispatchCommand };
}

// Creates a CommandHandler that Handles Command
function createCommandHandler(commandNames, _handleCommand) {
	let handleCommand = (() => {
		var _ref5 = _asyncToGenerator(function* (command) {
			return _handleCommand(command);
		});

		return function handleCommand(_x4) {
			return _ref5.apply(this, arguments);
		};
	})();

	debug('createCommandHandler()');

	function canHandleCommand(commandName) {
		return commandNames.includes(commandName);
	}

	return { handleCommand, canHandleCommand };
}