'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createDirectoryResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _renderDirectoryResource = require('./renderDirectoryResource');

var _renderDirectoryResource2 = _interopRequireDefault(_renderDirectoryResource);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const pugFiles = ['_index.pug', 'index.pug'];
const scssFiles = ['_index.scss', 'index.scss'];
const directoryResourceGlobPattern = '**/';
const directoryResourceType = 'directory';

function createDirectoryResourceProvider({ findFiles, fileExists, readFile, watchFiles, writeFile, resolveInputPath }) {
	let getDirectoryResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			if (!directoryResourceCache) {
				let directories = yield getDirectories();
				let globals = yield getGlobals();
				let directoryResources = yield createDirectoryResources(directories, globals);
				directoryResourceCache = directoryResources.reduce(function (directoryResourceCache, directoryResource) {
					directoryResourceCache[directoryResource.id] = directoryResource;
					return directoryResourceCache;
				}, {});
			}

			return Object.values(directoryResourceCache);
		});

		return function getDirectoryResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let createDirectoryResources = (() => {
		var _ref2 = _asyncToGenerator(function* (directories, globals) {
			let createDirectoryResourcePromises = directories.map(function (directory) {
				return createDirectoryResource(directory, globals);
			});

			return Promise.all(createDirectoryResourcePromises);
		});

		return function createDirectoryResources(_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	})();

	let createDirectoryResource = (() => {
		var _ref3 = _asyncToGenerator(function* (directory, globals) {
			let id = getDirectoryResourceId(directory);
			let inDir = directory;
			let outDir = directory;
			let outFile = _path2.default.join(directory, 'index.html');
			let physicalPath = resolveInputPath(directory);
			let locals = yield getData(directory);
			let data = (0, _deepmerge2.default)(globals, locals);
			let type = directoryResourceType;
			let mimeType = 'text/html';

			return { id, inDir, outDir, outFile, physicalPath, data, type, mimeType };
		});

		return function createDirectoryResource(_x3, _x4) {
			return _ref3.apply(this, arguments);
		};
	})();

	let getDirectories = (() => {
		var _ref4 = _asyncToGenerator(function* () {
			return findFiles(directoryResourceGlobPattern).then(function (directories) {
				return directories.filter(function (directory) {
					const doesNotStartWithAnUnderscore = _path2.default.parse(directory).base[0] !== '_';
					const hasPugFile = pugFiles.some(function (pugFile) {
						return fileExists(_path2.default.join(directory, pugFile));
					});
					const hasScssFile = scssFiles.some(function (scssFile) {
						return fileExists(_path2.default.join(directory, scssFile));
					});

					return doesNotStartWithAnUnderscore && hasPugFile && hasScssFile;
				});
			});
		});

		return function getDirectories() {
			return _ref4.apply(this, arguments);
		};
	})();

	let getData = (() => {
		var _ref5 = _asyncToGenerator(function* (directory) {
			try {
				let dataJson = yield getDataJson(directory);

				return JSON.parse(dataJson);
			} catch (err) {
				return {};
			}
		});

		return function getData(_x5) {
			return _ref5.apply(this, arguments);
		};
	})();

	let getDataJson = (() => {
		var _ref6 = _asyncToGenerator(function* (directory) {
			let dataJsonPath = _path2.default.join(directory, '_data.json');
			let dataJson = yield readFile(dataJsonPath, 'utf8');

			return dataJson;
		});

		return function getDataJson(_x6) {
			return _ref6.apply(this, arguments);
		};
	})();

	let compileDirectoryResource = (() => {
		var _ref7 = _asyncToGenerator(function* (directoryResource, resourceCompilationContext) {
			const variants = directoryResource.data.variants || 1;

			for (let variant = 0; variant < variants; variant++) {
				const resourceCompilationContextWithVariant = _extends({}, resourceCompilationContext, { variant });
				const renderedDirectoryResource = yield (0, _renderDirectoryResource2.default)(directoryResource, resourceCompilationContextWithVariant);
				const outFileName = ['index', variant, 'html'].filter(Boolean).join('.');
				const outFile = _path2.default.join(directoryResource.outDir, outFileName);
				yield writeFile(outFile, renderedDirectoryResource, 'utf8');
			}
		});

		return function compileDirectoryResource(_x7, _x8) {
			return _ref7.apply(this, arguments);
		};
	})();

	let getGlobals = (() => {
		var _ref8 = _asyncToGenerator(function* () {
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
		});

		return function getGlobals() {
			return _ref8.apply(this, arguments);
		};
	})();

	let directoryResourceCache;

	return {
		getResources: getDirectoryResources,
		compileResource: compileDirectoryResource,
		canCompileResource: canCompileDirectoryResource,
		watchResources: watchDirectoryResources
	};

	function watchDirectoryResources(onChange) {
		watchFiles(directoryResourceGlobPattern).on('all', (event, directory) => {
			if (directoryResourceCache) {
				directoryResourceCache = null;
			}

			onChange();
		});
	}

	function canCompileDirectoryResource(directoryResource) {
		return directoryResource.type === directoryResourceType;
	}

	function getDirectoryResourceId(directory) {
		return '/' + directory.split(_path2.default.sep).join('/');
	}
}