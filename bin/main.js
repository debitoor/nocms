#!/usr/bin/env node
'use strict';

let main = (() => {
	var _ref = _asyncToGenerator(function* () {
		try {
			const validCommands = ['compile', 'server', 'worker'];
			const { command, argv } = (0, _commandLineCommands2.default)(validCommands);

			const optionDefinitions = {
				compile: [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }],
				server: [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }, { name: 'port', type: Number }],
				worker: [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }]
			};

			const options = (0, _commandLineArgs2.default)(optionDefinitions[command], argv);

			const inDir = options['in-dir'];
			const outDir = options['out-dir'];
			const port = options['port'];

			// create an array to hold all the resource providers
			const resourceProviders = [];

			// create a function that addons can use to register resource providers
			const registerResourceProvider = (0, _createRegisterResourceProvider2.default)(resourceProviders);

			// create the activation contenxt that plugins will get when activated
			const pluginActivationContext = {
				registerResourceProvider,
				fileExists: (0, _createDirectoryBoundFileExists2.default)(_fileExists2.default, inDir),
				findFiles: (0, _createDirectoryBoundFindFilesAsync2.default)(_findFilesAsync2.default, inDir),
				readFile: (0, _createDirectoryBoundReadFileAsync2.default)(_readFileAsync2.default, inDir),
				watchFiles: (0, _createDirectoryBoundWatchFiles2.default)(_watchFiles2.default, inDir),
				writeFile: (0, _createDirectoryBoundWriteFileAsync2.default)(_writeFileAsync2.default, outDir),
				resolveInputPath: (0, _createDirectoryBoundResolvePath2.default)(inDir),
				resolveOutputPath: (0, _createDirectoryBoundResolvePath2.default)(outDir)
			};

			// load all the addons with the activation content
			yield (0, _loadPlugins2.default)(pluginActivationContext);

			// create our logging decorated composite resource provider that uses all the resource providers registered by the addons
			const resourceProvider = (0, _createLoggingDecoratedResourceProvider2.default)((0, _createCompositeResourceProvider2.default)(resourceProviders));

			let commandSender, resources, resourceCompilationContext;

			switch (command) {
				case 'compile':
					let compileStarted = process.hrtime();

					commandSender = (0, _threading.createCommandSender)();
					resources = yield resourceProvider.getResources();

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
					commandSender = (0, _threading.createCommandSender)((0, _threading.createCommandWorkerProcessPool)(1));

					(0, _createWebServer2.default)({ commandSender, resolveOutputPath: (0, _createDirectoryBoundResolvePath2.default)(outDir), resourceProvider, port });
					break;

				case 'worker':
					{
						const commandHandlers = [(0, _threading.createCommandHandler)(['compileResource'], (() => {
							var _ref2 = _asyncToGenerator(function* (command) {
								const { resourceId, cache } = command.params;

								if (!resourceCompilationContext || !cache) {
									const resources = yield resourceProvider.getResources();
									const resourceMap = (0, _createResourceMap2.default)(resources);
									const resourceTree = (0, _createResourceTree2.default)(resourceMap);

									resourceCompilationContext = { resourceMap, resourceTree };
								}

								const resource = resourceCompilationContext.resourceMap[resourceId];

								if (!resource) {
									throw new Error(`Resource ${resourceId} Not Found`);
								}

								return resourceProvider.compileResource(resource, resourceCompilationContext);
							});

							return function (_x) {
								return _ref2.apply(this, arguments);
							};
						})())];

						const commandDispatcher = (0, _threading.createCommandDispatcher)(commandHandlers);
						const commandReceiver = (0, _threading.createCommandReceiver)(commandDispatcher);
						commandReceiver.idle();
					}
			}
		} catch (err) {
			console.error(err);
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

var _createDirectoryBoundFileExists = require('../lib/createDirectoryBoundFileExists');

var _createDirectoryBoundFileExists2 = _interopRequireDefault(_createDirectoryBoundFileExists);

var _createDirectoryBoundFindFilesAsync = require('../lib/createDirectoryBoundFindFilesAsync');

var _createDirectoryBoundFindFilesAsync2 = _interopRequireDefault(_createDirectoryBoundFindFilesAsync);

var _createDirectoryBoundReadFileAsync = require('../lib/createDirectoryBoundReadFileAsync');

var _createDirectoryBoundReadFileAsync2 = _interopRequireDefault(_createDirectoryBoundReadFileAsync);

var _createDirectoryBoundResolvePath = require('../lib/createDirectoryBoundResolvePath');

var _createDirectoryBoundResolvePath2 = _interopRequireDefault(_createDirectoryBoundResolvePath);

var _createDirectoryBoundWatchFiles = require('../lib/createDirectoryBoundWatchFiles');

var _createDirectoryBoundWatchFiles2 = _interopRequireDefault(_createDirectoryBoundWatchFiles);

var _createDirectoryBoundWriteFileAsync = require('../lib/createDirectoryBoundWriteFileAsync');

var _createDirectoryBoundWriteFileAsync2 = _interopRequireDefault(_createDirectoryBoundWriteFileAsync);

var _createLoggingDecoratedResourceProvider = require('../lib/createLoggingDecoratedResourceProvider');

var _createLoggingDecoratedResourceProvider2 = _interopRequireDefault(_createLoggingDecoratedResourceProvider);

var _createRegisterResourceProvider = require('../lib/createRegisterResourceProvider');

var _createRegisterResourceProvider2 = _interopRequireDefault(_createRegisterResourceProvider);

var _createResourceMap = require('../lib/createResourceMap');

var _createResourceMap2 = _interopRequireDefault(_createResourceMap);

var _createResourceTree = require('../lib/createResourceTree');

var _createResourceTree2 = _interopRequireDefault(_createResourceTree);

var _createWebServer = require('../lib/createWebServer');

var _createWebServer2 = _interopRequireDefault(_createWebServer);

var _fileExists = require('../lib/fileExists');

var _fileExists2 = _interopRequireDefault(_fileExists);

var _findFilesAsync = require('../lib/findFilesAsync');

var _findFilesAsync2 = _interopRequireDefault(_findFilesAsync);

var _loadPlugins = require('../lib/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _readFileAsync = require('../lib/readFileAsync');

var _readFileAsync2 = _interopRequireDefault(_readFileAsync);

var _watchFiles = require('../lib/watchFiles');

var _watchFiles2 = _interopRequireDefault(_watchFiles);

var _writeFileAsync = require('../lib/writeFileAsync');

var _writeFileAsync2 = _interopRequireDefault(_writeFileAsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

if (!Object.values) {
	_object2.default.shim();
}

main();