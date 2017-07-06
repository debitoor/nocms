'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.writeFileAsync = exports.readFileAsync = exports.findFilesAsync = exports.cleanDirectoryAsync = undefined;

let cleanDirectoryAsync = exports.cleanDirectoryAsync = (() => {
	var _ref = _asyncToGenerator(function* (directory) {
		debug('cleanDirectoryAsync(%s)', directory);

		return new Promise(function (resolve) {
			_fsExtra2.default.emptyDir(directory, function (err) {
				if (err) {
					throw err;
				}

				resolve();
			});
		});
	});

	return function cleanDirectoryAsync(_x) {
		return _ref.apply(this, arguments);
	};
})();

let findFilesAsync = exports.findFilesAsync = (() => {
	var _ref5 = _asyncToGenerator(function* (pattern, options) {
		debug('findFilesAsync(%s, %o)', pattern, options);

		return new Promise(function (resolve, reject) {
			(0, _glob2.default)(pattern, options, function (err, files) {
				if (err) {
					return reject(err);
				}

				resolve(files);
			});
		});
	});

	return function findFilesAsync(_x9, _x10) {
		return _ref5.apply(this, arguments);
	};
})();

let readFileAsync = exports.readFileAsync = (() => {
	var _ref6 = _asyncToGenerator(function* (file, options) {
		debug('readFileAsync(%s, %o)', file, options);

		return new Promise(function (resolve, reject) {
			_fs2.default.readFile(file, options, function (err, data) {
				if (err) {
					return reject(err);
				}

				resolve(data);
			});
		});
	});

	return function readFileAsync(_x11, _x12) {
		return _ref6.apply(this, arguments);
	};
})();

let writeFileAsync = exports.writeFileAsync = (() => {
	var _ref7 = _asyncToGenerator(function* (file, data, options) {
		debug('writeFileAsync(%s, %o, %o)', file, options);

		return new Promise(function (resolve) {
			let directory = _path2.default.parse(file).dir;

			_fsExtra2.default.ensureDir(directory, function (err) {
				if (err) {
					throw err;
				}

				_fsExtra2.default.outputFile(file, data, options, function (err) {
					if (err) {
						throw err;
					}

					resolve();
				});
			});
		});
	});

	return function writeFileAsync(_x13, _x14, _x15) {
		return _ref7.apply(this, arguments);
	};
})();

exports.createDirectoryBoundFileExists = createDirectoryBoundFileExists;
exports.createDirectoryBoundFindFilesAsync = createDirectoryBoundFindFilesAsync;
exports.createDirectoryBoundReadFileAsync = createDirectoryBoundReadFileAsync;
exports.createDirectoryBoundResolvePath = createDirectoryBoundResolvePath;
exports.createDirectoryBoundWatchFiles = createDirectoryBoundWatchFiles;
exports.createDirectoryBoundWriteFileAsync = createDirectoryBoundWriteFileAsync;
exports.fileExists = fileExists;
exports.watchFiles = watchFiles;

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('./debug');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug.createDebug)('io');

function createDirectoryBoundFileExists(directory) {
	debug('createDirectoryBoundFileExists(%s)', directory);

	return function directoryBoundFileExists(file) {
		debug('directoryBoundFileExists(%s)', file);
		file = _path2.default.resolve(directory, file);

		return fileExists(file);
	};
}

function createDirectoryBoundFindFilesAsync(directory) {
	debug('createDirectoryBoundFindFilesAsync(%s)', directory);

	return (() => {
		var _ref2 = _asyncToGenerator(function* (pattern, options) {
			debug('directoryBoundFindFilesAsync(%s, %o)', pattern, options);

			pattern = _path2.default.posix.join(directory, pattern);

			return findFilesAsync(pattern, options).then(function (files) {
				return files.map(function (file) {
					return _path2.default.relative(directory, file);
				});
			});
		});

		function directoryBoundFindFilesAsync(_x2, _x3) {
			return _ref2.apply(this, arguments);
		}

		return directoryBoundFindFilesAsync;
	})();
}

function createDirectoryBoundReadFileAsync(directory) {
	debug('createDirectoryBoundReadFileAsync(%s)', directory);

	return (() => {
		var _ref3 = _asyncToGenerator(function* (file, options) {
			debug('directoryBoundReadFileAsync(%s, %d)', file, options);

			file = _path2.default.resolve(directory, file);

			return readFileAsync(file, options);
		});

		function directoryBoundReadFileAsync(_x4, _x5) {
			return _ref3.apply(this, arguments);
		}

		return directoryBoundReadFileAsync;
	})();
}

function createDirectoryBoundResolvePath(directory) {
	debug('createDirectoryBoundResolvePath(%s)', directory);

	return function directoryBoundResolvePath(file) {
		debug('directoryBoundResolvePath(%s)', file);

		return _path2.default.resolve(directory, file);
	};
}

function createDirectoryBoundWatchFiles(directory) {
	debug('createDirectoryBoundWatchFiles(%s)', directory);

	return function directoryBoundWatchFiles(pattern, options) {
		debug('directoryBoundWatchFiles(%s, %o)', pattern, options);

		options = options || {};
		options.cwd = directory;

		return watchFiles(pattern, options);
	};
}

function createDirectoryBoundWriteFileAsync(directory) {
	debug('createDirectoryBoundWriteFileAsync(%s)', directory);

	return (() => {
		var _ref4 = _asyncToGenerator(function* (file, data, options) {
			debug('directoryBoundWriteFileAsync(%s, %o, %o)', file, data, options);

			file = _path2.default.resolve(directory, file);

			return writeFileAsync(file, data, options);
		});

		function directoryBoundWriteFileAsync(_x6, _x7, _x8) {
			return _ref4.apply(this, arguments);
		}

		return directoryBoundWriteFileAsync;
	})();
}

function fileExists(file) {
	debug('fileExists(%s)', file);

	return _fs2.default.existsSync(file);
}

function watchFiles(pattern, options) {
	debug('watchFiles(%s, %o)', pattern, options);

	return _chokidar2.default.watch(pattern, options);
}