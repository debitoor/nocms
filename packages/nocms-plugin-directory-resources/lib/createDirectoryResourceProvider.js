'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

let getDirectoryResources = (() => {
	var _ref = _asyncToGenerator(function* (findFiles, readFile, resolveInputPath) {
		try {
			if (!directoryResourceCache) {
				let directories = yield getDirectories(findFiles);
				let globals = yield getGlobals(readFile);
				let directoryResources = yield createDirectoryResources(readFile, resolveInputPath, directories, globals);
				directoryResourceCache = directoryResources.reduce(function (directoryResourceCache, directoryResource) {
					directoryResourceCache[directoryResource.id] = directoryResource;
					return directoryResourceCache;
				}, {});
			}

			return Object.values(directoryResourceCache);
		} catch (err) {
			throw err;
		}
	});

	return function getDirectoryResources(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let createDirectoryResources = (() => {
	var _ref2 = _asyncToGenerator(function* (readFile, resolveInputPath, directories, globals) {
		let createDirectoryResourcePromises = directories.map(function (directory) {
			return createDirectoryResource(readFile, resolveInputPath, directory, globals);
		});

		return Promise.all(createDirectoryResourcePromises);
	});

	return function createDirectoryResources(_x4, _x5, _x6, _x7) {
		return _ref2.apply(this, arguments);
	};
})();

let createDirectoryResource = (() => {
	var _ref3 = _asyncToGenerator(function* (readFile, resolveInputPath, directory, globals) {
		try {
			let id = '/' + directory.split(_path2.default.sep).join('/');
			let inDir = directory;
			let outFile = _path2.default.join(directory, 'index.html');
			let physicalPath = resolveInputPath(directory);
			let data = Object.assign({}, globals, (yield getData(readFile, directory)));
			let mimeType = 'text/html';

			return { id, inDir, outFile, physicalPath, data, mimeType };
		} catch (err) {
			throw err;
		}
	});

	return function createDirectoryResource(_x8, _x9, _x10, _x11) {
		return _ref3.apply(this, arguments);
	};
})();

let getDirectories = (() => {
	var _ref4 = _asyncToGenerator(function* (findFiles) {
		return findFiles('**/').then(function (directories) {
			return directories.filter(function (directory) {
				return _path2.default.parse(directory).base[0] !== '_';
			});
		});
	});

	return function getDirectories(_x12) {
		return _ref4.apply(this, arguments);
	};
})();

let getData = (() => {
	var _ref5 = _asyncToGenerator(function* (readFile, directory) {
		try {
			let dataJson = yield getDataJson(readFile, directory);

			return JSON.parse(dataJson);
		} catch (err) {
			return {};
		}
	});

	return function getData(_x13, _x14) {
		return _ref5.apply(this, arguments);
	};
})();

let getDataJson = (() => {
	var _ref6 = _asyncToGenerator(function* (readFile, directory) {
		try {
			let dataJsonPath = _path2.default.join(directory, '_data.json');
			let dataJson = yield readFile(dataJsonPath, 'utf8');

			return dataJson;
		} catch (err) {
			throw err;
		}
	});

	return function getDataJson(_x15, _x16) {
		return _ref6.apply(this, arguments);
	};
})();

let compileDirectoryResource = (() => {
	var _ref7 = _asyncToGenerator(function* (writeFile, directoryResource, resourceCompilationContext) {
		try {
			let renderedDirectoryResource = yield (0, _renderDirectoryResource2.default)(directoryResource, resourceCompilationContext);

			return writeFile(directoryResource.outFile, renderedDirectoryResource, 'utf8');
		} catch (err) {
			throw err;
		}
	});

	return function compileDirectoryResource(_x17, _x18, _x19) {
		return _ref7.apply(this, arguments);
	};
})();

let getGlobals = (() => {
	var _ref8 = _asyncToGenerator(function* (readFile) {
		try {
			let globals;
			let env = process.env.NODE_ENV || 'development';

			let defaultGlobalsJson = yield readFile('_globals.json');
			let defaultGlobals = JSON.parse(defaultGlobalsJson);

			try {
				let envGlobalsJson = yield readFile(`_globals.${env}.json`);
				let envGlobals = JSON.parse(envGlobalsJson);

				globals = (0, _deepmerge2.default)(defaultGlobals, envGlobals);
			} catch (err) {
				// We do not force having env-specific _globals.json, thus just proceed if it does not exist.
				globals = defaultGlobals;
			}

			return globals;
		} catch (err) {
			throw err;
		}
	});

	return function getGlobals(_x20) {
		return _ref8.apply(this, arguments);
	};
})();

exports.default = createDirectoryResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _renderDirectoryResource = require('./renderDirectoryResource');

var _renderDirectoryResource2 = _interopRequireDefault(_renderDirectoryResource);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let directoryResourceCache;

function createDirectoryResourceProvider({ findFiles, readFile, watchFiles, writeFile, resolveInputPath }) {
	watchFiles('**/').on('all', handleAll);

	function handleAll(event, directory) {
		if (directoryResourceCache) {
			directoryResourceCache = null;
		}
	}

	return {
		getResources: getDirectoryResources.bind(null, findFiles, readFile, resolveInputPath),
		compileResource: compileDirectoryResource.bind(null, writeFile)
	};
}