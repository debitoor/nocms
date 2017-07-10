import {
	createDirectoryBoundFileExists,
	createDirectoryBoundFindFilesAsync,
	createDirectoryBoundReadFileAsync,
	createDirectoryBoundResolvePath,
	createDirectoryBoundWatchFiles,
	createDirectoryBoundWriteFileAsync
} from './io';

export default function createPluginActivationContext (inDir, outDir, registerResourceProvider, configFile) {
	return {
		registerResourceProvider,
		configFile: configFile,
		fileExists: createDirectoryBoundFileExists(inDir),
		findFiles: createDirectoryBoundFindFilesAsync(inDir),
		readFile: createDirectoryBoundReadFileAsync(inDir),
		watchFiles: createDirectoryBoundWatchFiles(inDir),
		writeFile: createDirectoryBoundWriteFileAsync(outDir),
		resolveInputPath: createDirectoryBoundResolvePath(inDir),
		resolveOutputPath: createDirectoryBoundResolvePath(outDir)
	};
}