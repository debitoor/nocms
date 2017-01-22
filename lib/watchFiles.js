'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = watchFiles;

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function watchFiles(pattern, options) {
	return _chokidar2.default.watch(pattern, options);
}