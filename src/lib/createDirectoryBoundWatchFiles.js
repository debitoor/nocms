export default function createDirectoryBoundWatchFiles (watchFiles, directory) {
	return function directoryBoundWatchFiles (pattern, options) {
		options = options || {};
		options.cwd = directory;
		
		return watchFiles(pattern, options);
	};
}