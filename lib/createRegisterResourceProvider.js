"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createRegisterResourceProvider;
function createRegisterResourceProvider(resourceProviders) {
	return function registerResourceProvider(resourceProvider) {
		resourceProviders.push(resourceProvider);
	};
}