import path from 'path';

export default function createDirectoryBoundFileExists (fileExists, directory) {
	return function directoryBoundFileExists (file) {
		file = path.resolve(directory, file);

		return fileExists(file);
	};
}