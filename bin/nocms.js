#!/usr/bin/env node
'use strict';

let main = (() => {
	var _ref = _asyncToGenerator(function* () {
		try {
			const validCommands = ['compile', 'server'];
			const { command, argv } = (0, _commandLineCommands2.default)(validCommands);

			const optionDefinitions = {
				compile: [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }],
				server: [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }, { name: 'port', type: Number }]
			};

			const options = (0, _commandLineArgs2.default)(optionDefinitions[command], argv);

			const inDir = options['in-dir'];
			const outDir = options['out-dir'];
			const port = options['port'];

			// create an array to hold all the resource providers
			const resourceProviders = [];

			// create a function that plugins can use to register resource providers
			const registerResourceProvider = (0, _createRegisterResourceProvider2.default)(resourceProviders);

			// create the activation contenxt that plugins will get when activated
			const pluginActivationContext = (0, _createPluginActivationContext2.default)(inDir, outDir, registerResourceProvider);

			// load all the addons with the activation content
			yield (0, _loadPlugins2.default)(pluginActivationContext);

			// create composite resource provider that uses all the resource providers registered by the plugins
			const resourceProvider = (0, _createCompositeResourceProvider2.default)(resourceProviders);

			// create the commandworker process pool that will handle compilation of resources
			const commandWorkerProcessPool = (0, _threading.createCommandWorkerProcessPool)(1, _path2.default.resolve(__dirname, './nocms-worker.js'), ['worker', '--in-dir', inDir, '--out-dir', outDir]);

			// create the command sender that send commands to the command worker process pool
			const commandSender = (0, _threading.createCommandSender)(commandWorkerProcessPool);

			switch (command) {
				case 'compile':
					let compileStarted = process.hrtime();
					let resources = yield resourceProvider.getResources();

					yield (0, _cleanDirectoryAsync2.default)(outDir);

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
					(0, _createWebServer2.default)({ commandSender, resolveOutputPath: pluginActivationContext.resolveOutputPath, resourceProvider, port });
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

var _threading = require('../lib/threading');

var _cleanDirectoryAsync = require('../lib/cleanDirectoryAsync');

var _cleanDirectoryAsync2 = _interopRequireDefault(_cleanDirectoryAsync);

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _commandLineCommands = require('command-line-commands');

var _commandLineCommands2 = _interopRequireDefault(_commandLineCommands);

var _createCompositeResourceProvider = require('../lib/createCompositeResourceProvider');

var _createCompositeResourceProvider2 = _interopRequireDefault(_createCompositeResourceProvider);

var _createPluginActivationContext = require('../lib/createPluginActivationContext');

var _createPluginActivationContext2 = _interopRequireDefault(_createPluginActivationContext);

var _createRegisterResourceProvider = require('../lib/createRegisterResourceProvider');

var _createRegisterResourceProvider2 = _interopRequireDefault(_createRegisterResourceProvider);

var _createWebServer = require('../lib/createWebServer');

var _createWebServer2 = _interopRequireDefault(_createWebServer);

var _loadPlugins = require('../lib/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

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