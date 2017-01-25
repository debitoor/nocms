#!/usr/bin/env node
'use strict';

let main = (() => {
	var _ref = _asyncToGenerator(function* () {
		try {
			const defaultOptionsDefinitions = [{ name: 'help', alias: 'h' }];

			const commands = ['compile', 'server'];

			const commandOptionDefinitions = {
				compile: [{ name: 'concurrency', alias: 'c', type: Number, defaultValue: (0, _os.cpus)().length, description: 'Concurrency.' }, { name: 'help', alias: 'h' }, { name: 'in-dir', alias: 'i', type: String, description: 'Input directory to read resources from.', required: true }, { name: 'out-dir', alias: 'o', type: String, description: 'Output directory to write compiled resource to.', required: true }],
				server: [{ name: 'concurrency', alias: 'c', type: Number, defaultValue: (0, _os.cpus)().length, description: 'Concurrency.' }, { name: 'help', alias: 'h' }, { name: 'in-dir', alias: 'i', type: String, description: 'input directory.', required: true }, { name: 'out-dir', alias: 'o', type: String, description: 'output directory.', required: true }, { name: 'port', alias: 'p', type: Number, description: 'port to listen to.', required: true }]
			};

			const defaultUsageDefinition = [{ header: 'NOCMS Command Line Interface', content: _nocmsAscii2.default, raw: true }, { header: 'Synopsis', content: '$ nocms <command> <options>' }, { header: 'Commands', content: [{ name: 'compile', summary: 'Compile a site.' }, { name: 'server', summary: 'Start a web server.' }] }, { header: 'Options', optionList: defaultOptionsDefinitions }];

			const commandUsageDefinitions = {
				compile: [{ header: 'NOCMS Command Line Interface', content: _nocmsAscii2.default, raw: true }, { header: 'Synopsis', content: '$ nocms compile <options>' }, { header: 'Options', optionList: commandOptionDefinitions['compile'] }],
				server: [{ header: 'NOCMS Command Line Interface', content: _nocmsAscii2.default, raw: true }, { header: 'Synopsis', content: '$ nocms server <options>' }, { header: 'Options', optionList: commandOptionDefinitions['server'] }]
			};

			let command, options;

			try {
				const result = (0, _commandLineCommands2.default)(commands);
				command = result.command;
				const optionDefinitions = commandOptionDefinitions[command];
				options = (0, _commandLineArgs2.default)(optionDefinitions, result.argv);

				const valid = optionDefinitions.filter(function (optionDefinition) {
					return optionDefinition.required;
				}).every(function (optionDefinition) {
					return Object.keys(options).includes(optionDefinition.name);
				});

				if (!valid) {
					options.help = true;
				}
			} catch (err) {
				command = command || '';
				options = { help: true };
			}

			if (options.help) {
				const usage = (0, _commandLineUsage2.default)(commandUsageDefinitions[command] || defaultUsageDefinition);
				console.log(usage);
				return;
			}

			const inDir = options['in-dir'];
			const outDir = options['out-dir'];
			const port = options['port'];
			const concurrency = options['concurrency'];

			// Create an array to hold all the resource providers.
			const resourceProviders = [];

			// Create a function that plugins can use to register resource providers.
			const registerResourceProvider = (0, _createRegisterResourceProvider2.default)(resourceProviders);

			// Create the activation contenxt that plugins will get when activated.
			const pluginActivationContext = (0, _createPluginActivationContext2.default)(inDir, outDir, registerResourceProvider);

			// Load all the plugins with the activation content.
			yield (0, _plugins.loadPlugins)(pluginActivationContext);

			// Create composite resource provider that uses all the resource providers registered by the plugins.
			const resourceProvider = (0, _createCompositeResourceProvider2.default)(resourceProviders);

			// Create the commandworker process pool that will handle compilation of resources.
			const commandWorkerProcessPool = (0, _threading.createCommandWorkerProcessPool)(concurrency, _path2.default.resolve(__dirname, './nocms-worker.js'), ['worker', '--in-dir', inDir, '--out-dir', outDir]);

			// Create the command sender that sends commands to the command worker process pool.
			const commandSender = (0, _threading.createCommandSender)(commandWorkerProcessPool);

			switch (command) {
				case 'compile':
					let compileStarted = process.hrtime();
					let resources = yield resourceProvider.getResources();

					yield (0, _io.cleanDirectoryAsync)(outDir);

					const commandPromises = resources.map(function (resource, idx) {
						return {
							id: idx,
							name: 'compileResource',
							params: { resourceId: resource.id, cache: true }
						};
					}).map(commandSender.sendCommand);

					Promise.all(commandPromises).then(function (results) {
						let compileFinished = process.hrtime(compileStarted);
						console.info(`Compiled ${resources.length} resources in %ds %dms`, compileFinished[0], compileFinished[1] / 1000000);

						process.exit(0);
					}).catch(function (err) {
						console.error('error', err, err.stack);

						process.exit(1);
					});

					break;

				case 'server':
					(0, _server.createServer)({ commandSender, resolveOutputPath: pluginActivationContext.resolveOutputPath, resourceProvider, port });
					break;
			}
		} catch (err) {
			console.error(err);

			throw err;
		}
	});

	return function main() {
		return _ref.apply(this, arguments);
	};
})();

var _io = require('../lib/io');

var _os = require('os');

var _threading = require('../lib/threading');

var _server = require('../lib/server');

var _plugins = require('../lib/plugins');

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _commandLineCommands = require('command-line-commands');

var _commandLineCommands2 = _interopRequireDefault(_commandLineCommands);

var _commandLineUsage = require('command-line-usage');

var _commandLineUsage2 = _interopRequireDefault(_commandLineUsage);

var _createCompositeResourceProvider = require('../lib/createCompositeResourceProvider');

var _createCompositeResourceProvider2 = _interopRequireDefault(_createCompositeResourceProvider);

var _createPluginActivationContext = require('../lib/createPluginActivationContext');

var _createPluginActivationContext2 = _interopRequireDefault(_createPluginActivationContext);

var _createRegisterResourceProvider = require('../lib/createRegisterResourceProvider');

var _createRegisterResourceProvider2 = _interopRequireDefault(_createRegisterResourceProvider);

var _nocmsAscii = require('../lib/nocmsAscii');

var _nocmsAscii2 = _interopRequireDefault(_nocmsAscii);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

if (!Object.values) {
	_object2.default.shim();
}

main();