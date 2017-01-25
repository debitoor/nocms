import fileExists from './fileExists';
import findFilesAsync from './findFilesAsync';
import readFileAsync from './readFileAsync';
import watchFiles from './watchFiles';
import writeFileAsync from './writeFileAsync';
import createDirectoryBoundFileExists from './createDirectoryBoundFileExists';
import createDirectoryBoundFindFilesAsync  from './createDirectoryBoundFindFilesAsync';
import createDirectoryBoundReadFileAsync from './createDirectoryBoundReadFileAsync';
import createDirectoryBoundResolvePath from './createDirectoryBoundResolvePath';
import createDirectoryBoundWatchFiles from './createDirectoryBoundWatchFiles';
import createDirectoryBoundWriteFileAsync from './createDirectoryBoundWriteFileAsync';

export default function createPluginActivationContext (inDir, outDir, registerResourceProvider) {
	return {
		registerResourceProvider,
		fileExists: createDirectoryBoundFileExists(fileExists, inDir),
		findFiles: createDirectoryBoundFindFilesAsync(findFilesAsync, inDir),
		readFile: createDirectoryBoundReadFileAsync(readFileAsync, inDir),
		watchFiles: createDirectoryBoundWatchFiles(watchFiles, inDir),
		writeFile: createDirectoryBoundWriteFileAsync(writeFileAsync, outDir),
		resolveInputPath: createDirectoryBoundResolvePath(inDir),
		resolveOutputPath: createDirectoryBoundResolvePath(outDir)
	};
}