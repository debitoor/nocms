'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

let getJsonResources = (() => {
	var _ref = _asyncToGenerator(function* (jsonResourceCache, findFiles, readFile) {
		try {
			if (!jsonResourceCache) {
				let jsonFiles = yield getJsonFiles(findFiles);
				let jsonResources = yield createJsonResources(readFile, jsonFiles);
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

	return function getJsonResources(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let createJsonResources = (() => {
	var _ref2 = _asyncToGenerator(function* (readFile, jsonFiles) {
		let createJsonResourcePromises = jsonFiles.map(function (jsonFile) {
			return createJsonResource(readFile, jsonFile);
		});

		return Promise.all(createJsonResourcePromises);
	});

	return function createJsonResources(_x4, _x5) {
		return _ref2.apply(this, arguments);
	};
})();

let createJsonResource = (() => {
	var _ref3 = _asyncToGenerator(function* (readFile, jsonFile) {
		try {
			let id = '/' + jsonFile.split(_path2.default.sep).join('/');
			let inFile = jsonFile;
			let outFile = jsonFile;
			let json = yield readFile(jsonFile);
			let data = JSON.parse(json);
			let mimeType = 'application/json';

			return { id, inFile, outFile, mimeType, data };
		} catch (err) {
			throw err;
		}
	});

	return function createJsonResource(_x6, _x7) {
		return _ref3.apply(this, arguments);
	};
})();

let compileJsonResource = (() => {
	var _ref4 = _asyncToGenerator(function* (readFile, writeFile, jsonResource) {
		try {
			let json = yield readFile(jsonResource.inFile);
			let data = JSON.stringify(JSON.parse(json));

			return writeFile(jsonResource.outFile, data, 'utf8');
		} catch (err) {
			throw err;
		}
	});

	return function compileJsonResource(_x8, _x9, _x10) {
		return _ref4.apply(this, arguments);
	};
})();

let getJsonFiles = (() => {
	var _ref5 = _asyncToGenerator(function* (findFiles) {
		return findFiles('**/!(_)*.json');
	});

	return function getJsonFiles(_x11) {
		return _ref5.apply(this, arguments);
	};
})();

exports.default = createJsonResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createJsonResourceProvider({ findFiles, readFile, watchFiles, writeFile }) {
	let jsonResourceCache;

	watchFiles('**/!(_)*.json').on('all', handleAll);

	function handleAll(event, jsonFile) {
		if (jsonResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createJsonResource(readFile, jsonFile).then(jsonResource => jsonResourceCache[jsonResource.id] = jsonResource);
					break;
				case 'unlink':
					let jsonResourceId = createJsonResourceId(jsonFile);
					delete jsonResourceCache[jsonResourceId];
					break;
			}
		}
	}

	return {
		getResources: getJsonResources.bind(null, jsonResourceCache, findFiles, readFile),
		compileResource: compileJsonResource.bind(null, readFile, writeFile)
	};
}

function createJsonResourceId(path) {
	return '/' + path.split(path.sep).join('/');
}