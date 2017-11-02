'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createJsonResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const jsonResourceGlobPattern = '**/!(_)*.json';
const jsonResourceType = 'json';

function createJsonResourceProvider({ findFiles, readFile, watchFiles, writeFile }) {
	let getJsonResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			try {
				if (!jsonResourceCache) {
					let jsonFiles = yield findFiles(jsonResourceGlobPattern);
					let jsonResources = yield createJsonResources(jsonFiles);
					jsonResourceCache = jsonResources.reduce(function (jsonResourceCache, jsonResource) {
						jsonResourceCache[jsonResource.id] = jsonResource;
						return jsonResourceCache;
					}, {});
				}

				return Object.values(jsonResourceCache);
			} catch (err) {
				throw err;
			}
		});

		return function getJsonResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let createJsonResources = (() => {
		var _ref2 = _asyncToGenerator(function* (jsonFiles) {
			let createJsonResourcePromises = jsonFiles.map(createJsonResource);

			return Promise.all(createJsonResourcePromises);
		});

		return function createJsonResources(_x) {
			return _ref2.apply(this, arguments);
		};
	})();

	let createJsonResource = (() => {
		var _ref3 = _asyncToGenerator(function* (jsonFile) {
			try {
				let id = createJsonResourceId(jsonFile);
				let inFile = jsonFile;
				let outFile = jsonFile;
				let json = yield readFile(jsonFile);
				let data = JSON.parse(json);
				let mimeType = 'application/json';
				let type = jsonResourceType;

				return { id, inFile, outFile, mimeType, data, type };
			} catch (err) {
				throw err;
			}
		});

		return function createJsonResource(_x2) {
			return _ref3.apply(this, arguments);
		};
	})();

	let compileJsonResource = (() => {
		var _ref4 = _asyncToGenerator(function* (jsonResource) {
			try {
				let json = yield readFile(jsonResource.inFile);
				let data = JSON.stringify(JSON.parse(json));

				return writeFile(jsonResource.outFile, data, 'utf8');
			} catch (err) {
				throw err;
			}
		});

		return function compileJsonResource(_x3) {
			return _ref4.apply(this, arguments);
		};
	})();

	let jsonResourceCache;

	return {
		getResources: getJsonResources,
		compileResource: compileJsonResource,
		canCompileResource: canCompileJsonResource,
		watchResources: watchJsonResources
	};

	function watchJsonResources(onChange) {
		watchFiles(jsonResourceGlobPattern).on('all', (event, jsonFile) => {
			if (jsonResourceCache) {
				switch (event) {
					case 'add':
					case 'change':
						createJsonResource(jsonFile).then(jsonResource => jsonResourceCache[jsonResource.id] = jsonResource);
						break;
					case 'unlink':
						let jsonResourceId = createJsonResourceId(jsonFile);
						delete jsonResourceCache[jsonResourceId];
						break;
				}
			}

			onChange();
		});
	}

	function canCompileJsonResource(jsonResource) {
		return jsonResource.type === jsonResourceType;
	}

	function createJsonResourceId(jsonFile) {
		return '/' + jsonFile.split(_path2.default.sep).join('/');
	}
}