"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createRegisterResourceProvider;
function createRegisterResourceProvider(resourceCompilers) {
	return function registerResourceProvider(resourceCompiler) {
		resourceCompilers.push(resourceCompiler);
	};
}