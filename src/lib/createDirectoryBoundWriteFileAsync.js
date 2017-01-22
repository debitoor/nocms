import path from 'path';

export default function createDirectoryBoundWriteFileAsync (writeFileAsync, directory) {
	return async function directoryBoundWriteFileAsync (file, data, options) {
		file = path.resolve(directory, file);

		return writeFileAsync(file, data, options);
	};
}
