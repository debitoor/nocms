"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createDirectoryBoundWatchFiles;
function createDirectoryBoundWatchFiles(watchFiles, directory) {
	return function directoryBoundWatchFiles(pattern, options) {
		options = options || {};
		options.cwd = directory;

		return watchFiles(pattern, options);
	};
}