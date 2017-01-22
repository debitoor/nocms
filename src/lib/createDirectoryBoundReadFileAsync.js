import path from 'path';

export default function createDirectoryBoundReadFileAsync (readFileAsync, directory) {
	return async function directoryBoundReadFileAsync (file, options) {
		file = path.resolve(directory, file);

		return readFileAsync(file, options);
	};
}