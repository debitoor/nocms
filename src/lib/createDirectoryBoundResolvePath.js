import path from 'path';

export default function createDirectoryBoundResolvePath (directory) {
	return function directoryBoundResolvePath (file) {
		 return path.resolve(directory, file);
	};
}