import chokidar  from 'chokidar';
import fs from 'fs';
import fsExtra from 'fs-extra';
import glob from 'glob';
import path from 'path';
import {createDebug} from './debug';

const debug = createDebug('io');

export async function cleanDirectoryAsync (directory) {
	debug('cleanDirectoryAsync(%s)', directory);

	return new Promise(resolve => {
		fsExtra.emptyDir(directory, err => {
			if (err) {
				throw err;
			}

			resolve();
		});
	});
}

export function createDirectoryBoundFileExists (directory) {
	debug('createDirectoryBoundFileExists(%s)', directory);

	return function directoryBoundFileExists (file) {
		debug('directoryBoundFileExists(%s)', file);
		file = path.resolve(directory, file);

		return fileExists(file);
	};
}

export function createDirectoryBoundFindFilesAsync (directory) {
	debug('createDirectoryBoundFindFilesAsync(%s)', directory);

	return async function directoryBoundFindFilesAsync (pattern, options) {
		debug('directoryBoundFindFilesAsync(%s, %o)', pattern, options);

		pattern = path.posix.join(directory, pattern);

		return findFilesAsync(pattern, options)
			.then(files => files.map(file => path.relative(directory, file)));
	};
}

export function createDirectoryBoundReadFileAsync (directory) {
	debug('createDirectoryBoundReadFileAsync(%s)', directory);
	
	return async function directoryBoundReadFileAsync (file, options) {
		debug('directoryBoundReadFileAsync(%s, %d)', file, options);

		file = path.resolve(directory, file);

		return readFileAsync(file, options);
	};
}

export function createDirectoryBoundResolvePath (directory) {
	debug('createDirectoryBoundResolvePath(%s)', directory);

	return function directoryBoundResolvePath (file) {
		debug('directoryBoundResolvePath(%s)', file);

		return path.resolve(directory, file);
	};
}

export function createDirectoryBoundWatchFiles (directory) {
	debug('createDirectoryBoundWatchFiles(%s)', directory);

	return function directoryBoundWatchFiles (pattern, options) {
		debug('directoryBoundWatchFiles(%s, %o)', pattern, options);

		options = options || {};
		options.cwd = directory;
		
		return watchFiles(pattern, options);
	};
}

export function createDirectoryBoundWriteFileAsync (directory) {
	debug('createDirectoryBoundWriteFileAsync(%s)', directory);

	return async function directoryBoundWriteFileAsync (file, data, options) {
		debug('directoryBoundWriteFileAsync(%s, %o, %o)', file, data, options);

		file = path.resolve(directory, file);

		return writeFileAsync(file, data, options);
	};
}


export async function findFilesAsync (pattern, options) {
	debug('findFilesAsync(%s, %o)', pattern, options);

	return new Promise((resolve, reject) => {
		glob(pattern, options, (err, files) => {
			if (err) {
				return reject(err);
			}
			
			resolve(files);
		});
	});
}

export function fileExists (file) {
	debug('fileExists(%s)', file);

	return fs.existsSync(file);
}

export async function readFileAsync (file, options) {
	debug('readFileAsync(%s, %o)', file, options);

	return new Promise((resolve, reject) => {
		fs.readFile(file, options, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data);
		});
	});
}

export function watchFiles (pattern, options) {
	debug('watchFiles(%s, %o)', pattern, options);
	options = {ignoreInitial: true, ...options};
	return chokidar.watch(pattern, options);
}

export async function writeFileAsync (file, data, options) {
	debug('writeFileAsync(%s, %o, %o)', file, options);

	return new Promise((resolve) => {
		let directory = path.parse(file).dir;

		fsExtra.ensureDir(directory, err => {
			if (err) {
				throw err;
			}

			fsExtra.outputFile(file, data, options, err => {
				if (err) {
					throw err;
				}

				resolve();
			});
		});
	});
}
