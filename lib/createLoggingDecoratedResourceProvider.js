'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createLoggingDecoratedResourceProvider;

var _createResourceProvider = require('./createResourceProvider');

var _createResourceProvider2 = _interopRequireDefault(_createResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createLoggingDecoratedResourceProvider(resourceProvider) {
	let getResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			console.log('getResources');

			return resourceProvider.getResources();
		});

		return function getResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let compileResource = (() => {
		var _ref2 = _asyncToGenerator(function* (resource, resourceCompilationContext) {
			try {
				let compileStarted = process.hrtime();
				let result = yield resourceProvider.compileResource(resource, resourceCompilationContext);
				let compileFinished = process.hrtime(compileStarted);

				console.info('Compiled %s in %ds %dms', resource.id, compileFinished[0], compileFinished[1] / 1000000);

				return result;
			} catch (err) {
				throw err;
			}
		});

		return function compileResource(_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	})();

	let loggingDecoratedResourceProvider = (0, _createResourceProvider2.default)(getResources, compileResource);

	return loggingDecoratedResourceProvider;
}