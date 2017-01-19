'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createDirectoryResourceProvider = require('./createDirectoryResourceProvider');

var _createDirectoryResourceProvider2 = _interopRequireDefault(_createDirectoryResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ createResourceProvider, registerResourceProvider, findFiles, readFile, watchFiles, writeFile, resolveInputPath }) {
	let directoryResourceProvider = (0, _createDirectoryResourceProvider2.default)({ findFiles, readFile, watchFiles, writeFile, resolveInputPath });

	registerResourceProvider(directoryResourceProvider);
}