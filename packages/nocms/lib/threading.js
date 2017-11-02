'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createCommandWorkerProcessPool = exports.createCommandWorkerProcess = exports.BUSY = exports.IDLE = undefined;

let createCommandWorkerProcess = exports.createCommandWorkerProcess = (() => {
	var _ref = _asyncToGenerator(function* (id, moduleName, args) {
		let sendCommand = (() => {
			var _ref2 = _asyncToGenerator(function* (command) {
				debug('commandWorkerProcess.%d.sendCommand', id);
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

			return function sendCommand(_x4) {
				return _ref2.apply(this, arguments);
			};
		})();

		debug('createCommandWorkerProcess(%d, %s, %o)', id, moduleName, args);

		moduleName = moduleName || process.argv[1];
		args = args || process.argv.slice(3);

		let childPromise;
		const commandPromises = {};
		const child = (0, _child_process.fork)(moduleName, args);
		child.id = id;
		child.idle = idle;
		child.busy = busy;
		child.sendCommand = sendCommand;
		child.on('message', handleMessage);
		child.on('error', handleError);
		child.on('exit', handleExit);

		return new Promise(function (resolve, reject) {
			return childPromise = { resolve, reject };
		});

		function handleError(err) {
			debug('commandWorkerProcess.%d.handleError(%o)', id, err);

			throw err;
		}

		function handleExit(code) {
			debug('commandWorkerProcess.%d.handleError(%d)', id, code);

			if (code) {
				throw new Error(`commandWorkerProcess.${id} exited with non zero code: ${code}`);
			}
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
	});

	return function createCommandWorkerProcess(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let createCommandWorkerProcessPool = exports.createCommandWorkerProcessPool = (() => {
	var _ref3 = _asyncToGenerator(function* (size, moduleName, args) {
		let getFirstIdleCommandWorkerProcess = (() => {
			var _ref4 = _asyncToGenerator(function* () {
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
				return _ref4.apply(this, arguments);
			};
		})();

		let getAllCommandWorkerProcesses = (() => {
			var _ref5 = _asyncToGenerator(function* () {
				debug('getAllCommandWorkerProcesses()');

				return commandWorkerProcesses;
			});

			return function getAllCommandWorkerProcesses() {
				return _ref5.apply(this, arguments);
			};
		})();

		debug('createCommandWorkerProcessPool(%d, %s, %o)', size, moduleName, args);

		const promises = [];
		const commandWorkerProcesses = yield Promise.all(Array.apply(null, { length: size }).map(function (value, id) {
			return createCommandWorkerProcess(id, moduleName, args);
		}));

		const idleCommandWorkerProcesses = [];

		process.on('exit', function (code) {
			debug('process.on(exit, %d)', code);

			commandWorkerProcesses.forEach(function (commandWorkerProcess) {
				return commandWorkerProcess.kill();
			});
		});

		process.on('SIGINT', function () {
			debug('process.on(SIGINT)');

			process.exit(1);
		});

		process.on('SIGTERM', function () {
			debug('process.on(SIGTERM)');

			process.exit(1);
		});

		commandWorkerProcesses.forEach(function (commandWorkerProcess) {
			commandWorkerProcess.on('idle', function () {
				debug('commandWorkerProcess.%d.on(%s)', commandWorkerProcess.id, 'idle');

				idleCommandWorkerProcesses.push(commandWorkerProcess);

				const promise = promises.shift();

				if (promise) {
					const nextIdleCommandWorkerProcess = idleCommandWorkerProcesses.shift();

					promise.resolve(nextIdleCommandWorkerProcess);
				}
			});

			commandWorkerProcess.on('busy', function () {
				debug('commandWorkerProcess.%d.on(%s)', commandWorkerProcess.id, 'busy');

				const indexOfCommandWorkerProcess = idleCommandWorkerProcesses.indexOf(commandWorkerProcess);

				if (indexOfCommandWorkerProcess > -1) {
					idleCommandWorkerProcesses.splice(indexOfCommandWorkerProcess, 1);
				}
			});
		});

		return { getFirstIdleCommandWorkerProcess, getAllCommandWorkerProcesses };
	});

	return function createCommandWorkerProcessPool(_x5, _x6, _x7) {
		return _ref3.apply(this, arguments);
	};
})();

// Send a command


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

function createCommandSender(commandWorkerProcessPool) {
	let sendCommand = (() => {
		var _ref6 = _asyncToGenerator(function* (command) {
			debug('commandSender.sendCommand(%o)', command);

			const commandWorkerProcess = yield commandWorkerProcessPool.getFirstIdleCommandWorkerProcess();

			return commandWorkerProcess.sendCommand(command);
		});

		return function sendCommand(_x8) {
			return _ref6.apply(this, arguments);
		};
	})();

	let sendCommandAll = (() => {
		var _ref7 = _asyncToGenerator(function* (command) {
			debug('commandSender.sendCommand(%o)', command);

			const commandWorkerProcesses = yield commandWorkerProcessPool.getAllCommandWorkerProcesses();

			return Promise.all(commandWorkerProcesses.map(function (commandWorkerProcess) {
				return commandWorkerProcess.sendCommand(command);
			}));
		});

		return function sendCommandAll(_x9) {
			return _ref7.apply(this, arguments);
		};
	})();

	debug('createCommandSender()');

	let commandSender = { sendCommand, sendCommandAll };

	commandWorkerProcessPool = commandWorkerProcessPool || createCommandWorkerProcessPool();

	return commandSender;
}

// Listens for process message and calls the command dispatcher when it receives a command;
function createCommandReceiver(commandDispatcher) {
	debug('createCommandReceiver()');

	process.on('message', handleMessage);

	return { busy, idle, ready };

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

	function busy() {
		debug('commandReceiver.busy()');
		process.send({ topic: 'busy' });
	}

	function idle() {
		debug('commandReceiver.idle()');
		process.send({ topic: 'idle' });
	}

	function ready() {
		debug('commandReceiver.ready()');
		process.send({ topic: 'ready' });
	}
}

// Creates a CommandDispatcher that Dispatches Commands to a CommandHandlers
function createCommandDispatcher(commandHandlers) {
	let dispatchCommand = (() => {
		var _ref8 = _asyncToGenerator(function* (command) {
			let commandHandler = commandHandlers.filter(function (commandHandler) {
				return commandHandler.canHandleCommand(command.type);
			})[0];

			if (!commandHandler) {
				throw new CommandHandlerNotFoundError(command);
			}

			return commandHandler.handleCommand(command);
		});

		return function dispatchCommand(_x10) {
			return _ref8.apply(this, arguments);
		};
	})();

	debug('createCommandDispatcher()');

	return { dispatchCommand };
}

// Creates a CommandHandler that Handles Command
function createCommandHandler(commandTypes, _handleCommand) {
	let handleCommand = (() => {
		var _ref9 = _asyncToGenerator(function* (command) {
			return _handleCommand(command);
		});

		return function handleCommand(_x11) {
			return _ref9.apply(this, arguments);
		};
	})();

	debug('createCommandHandler()');

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