import {
	createDirectoryBoundFileExists,
	createDirectoryBoundFindFilesAsync,
	createDirectoryBoundReadFileAsync,
	createDirectoryBoundResolvePath,
	createDirectoryBoundWatchFiles,
	createDirectoryBoundWriteFileAsync
} from './io';

export default function createPluginActivationContext (inDir, outDir, registerResourceProvider, config) {
	return {
		registerResourceProvider,
		fileExists: createDirectoryBoundFileExists(inDir),
		findFiles: createDirectoryBoundFindFilesAsync(inDir),
		readFile: createDirectoryBoundReadFileAsync(inDir),
		watchFiles: createDirectoryBoundWatchFiles(inDir),
		writeFile: createDirectoryBoundWriteFileAsync(outDir),
		config: config,
		resolveInputPath: createDirectoryBoundResolvePath(inDir),
		resolveOutputPath: createDirectoryBoundResolvePath(outDir)
	};
}