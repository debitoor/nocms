"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createCompositeResourceProvider;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createCompositeResourceProvider(resourceProviders) {
	let getResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			return Promise.all(resourceProviders.map(function (resourceProvider) {
				return resourceProvider.getResources().then(function (resources) {
					resources.forEach(function (resource) {
						resourceResourceProviderMap.set(resource, resourceProvider);
					});

					return resources;
				});
			})).then(function (resourceProvidersResources) {
				return [].concat.apply([], resourceProvidersResources);
			});
		});

		return function getResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let compileResource = (() => {
		var _ref2 = _asyncToGenerator(function* (resource, resourceCompilationContext) {
			let resourceProvider = resourceResourceProviderMap.get(resource);

			if (!resourceProvider) {
				throw new Error(`No resource provider found for resource ${ resource.id }`);
			}

			return resourceProvider.compileResource(resource, resourceCompilationContext);
		});

		return function compileResource(_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	})();

	let resourceResourceProviderMap = new Map();

	return { getResources, compileResource };
}