'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createDirectoryBoundResolvePath;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDirectoryBoundResolvePath(directory) {
	return function directoryBoundResolvePath(file) {
		return _path2.default.resolve(directory, file);
	};
}