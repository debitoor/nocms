'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createWatchFiles;

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createWatchFiles(dir) {
	return function watchFiles(pattern, callback) {
		return _chokidar2.default.watch(pattern, { cwd: dir });
	};
}