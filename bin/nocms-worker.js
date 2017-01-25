#!/usr/bin/env node
'use strict';

let main = (() => {
	var _ref = _asyncToGenerator(function* () {
		try {
			const optionDefinitions = [{ name: 'in-dir', type: String }, { name: 'out-dir', type: String }];

			const options = (0, _commandLineArgs2.default)(optionDefinitions);

			const inDir = options['in-dir'];
			const outDir = options['out-dir'];

			// Create an array to hold all the resource providers
			const resourceProviders = [];

			// Create a function that plugins can use to register resource providers
			const registerResourceProvider = (0, _createRegisterResourceProvider2.default)(resourceProviders);

			// Create the activation contenxt that plugins will get when activated
			const pluginActivationContext = (0, _createPluginActivationContext2.default)(inDir, outDir, registerResourceProvider);

			// Load all the addons with the activation content
			yield (0, _loadPlugins2.default)(pluginActivationContext);

			// Create our logging decorated composite resource provider that uses all the resource providers registered by the addons
			const resourceProvider = (0, _createLoggingDecoratedResourceProvider2.default)((0, _createCompositeResourceProvider2.default)(resourceProviders));

			let resourceCompilationContext;

			// Create command handlers.
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

			// Create command dispatcher that dispatches commands to command handlers.
			const commandDispatcher = (0, _threading.createCommandDispatcher)(commandHandlers);

			// Create a command receiver that receives commands and dispatches them using the command disaptcher.
			const commandReceiver = (0, _threading.createCommandReceiver)(commandDispatcher);

			// Signal that the command receiver is now idle and ready to receive commands.
			commandReceiver.idle();
		} catch (err) {
			console.error(err);
		}
	});

	return function main() {
		return _ref.apply(this, arguments);
	};
})();

var _threading = require('../lib/threading');

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _createCompositeResourceProvider = require('../lib/createCompositeResourceProvider');

var _createCompositeResourceProvider2 = _interopRequireDefault(_createCompositeResourceProvider);

var _createLoggingDecoratedResourceProvider = require('../lib/createLoggingDecoratedResourceProvider');

var _createLoggingDecoratedResourceProvider2 = _interopRequireDefault(_createLoggingDecoratedResourceProvider);

var _createPluginActivationContext = require('../lib/createPluginActivationContext');

var _createPluginActivationContext2 = _interopRequireDefault(_createPluginActivationContext);

var _createRegisterResourceProvider = require('../lib/createRegisterResourceProvider');

var _createRegisterResourceProvider2 = _interopRequireDefault(_createRegisterResourceProvider);

var _createResourceMap = require('../lib/createResourceMap');

var _createResourceMap2 = _interopRequireDefault(_createResourceMap);

var _createResourceTree = require('../lib/createResourceTree');

var _createResourceTree2 = _interopRequireDefault(_createResourceTree);

var _loadPlugins = require('../lib/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

if (!Object.values) {
	_object2.default.shim();
}

main();