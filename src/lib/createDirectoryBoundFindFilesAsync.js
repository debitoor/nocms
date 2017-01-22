import path from 'path';

export default function createDirectoryBoundFindFilesAsync (findFilesAsync, directory) {
	return async function directoryBoundFindFilesAsync (pattern, options) {
		pattern = path.posix.join(directory, pattern);

		return findFilesAsync(pattern, options)
			.then(files => files.map(file => path.relative(directory, file)));
	};
}