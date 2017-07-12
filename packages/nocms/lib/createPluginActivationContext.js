'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createPluginActivationContext;

var _io = require('./io');

function createPluginActivationContext(inDir, outDir, registerResourceProvider, config) {
	return {
		registerResourceProvider,
		config: config,
		fileExists: (0, _io.createDirectoryBoundFileExists)(inDir),
		findFiles: (0, _io.createDirectoryBoundFindFilesAsync)(inDir),
		readFile: (0, _io.createDirectoryBoundReadFileAsync)(inDir),
		watchFiles: (0, _io.createDirectoryBoundWatchFiles)(inDir),
		writeFile: (0, _io.createDirectoryBoundWriteFileAsync)(outDir),
		resolveInputPath: (0, _io.createDirectoryBoundResolvePath)(inDir),
		resolveOutputPath: (0, _io.createDirectoryBoundResolvePath)(outDir)
	};
}