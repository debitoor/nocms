'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createDirectoryBoundFileExists;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDirectoryBoundFileExists(fileExists, directory) {
	return function directoryBoundFileExists(file) {
		file = _path2.default.resolve(directory, file);

		return fileExists(file);
	};
}