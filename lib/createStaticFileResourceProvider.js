'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

let getStaticFileResources = (() => {
	var _ref = _asyncToGenerator(function* (findFiles, readFile, directory, pattern) {
		try {
			let newPath = _path2.default.posix.join(directory, pattern);
			let staticFiles = yield findFiles(newPath);
			let staticFileResources = yield createStaticFileResources(readFile, staticFiles, directory);

			return staticFileResources;
		} catch (err) {
			throw err;
		}
	});

	return function getStaticFileResources(_x, _x2, _x3, _x4) {
		return _ref.apply(this, arguments);
	};
})();

let createStaticFileResources = (() => {
	var _ref2 = _asyncToGenerator(function* (readFile, staticFiles, directory) {
		let createStaticFileResourcePromises = staticFiles.map(function (staticFile) {
			return createStaticFileResource(readFile, staticFile, directory);
		});

		return Promise.all(createStaticFileResourcePromises);
	});

	return function createStaticFileResources(_x5, _x6, _x7) {
		return _ref2.apply(this, arguments);
	};
})();

let createStaticFileResource = (() => {
	var _ref3 = _asyncToGenerator(function* (readFile, staticFile, directory) {
		try {
			let newPath = _path2.default.relative(directory, staticFile);
			let id = '/' + newPath.split(_path2.default.sep).join('/');
			let outFile = newPath.split(_path2.default.sep).join(_path2.default.sep);
			let inFile = staticFile;

			let data = {};
			let mimeType = _mime2.default.lookup(id);

			return { id, inFile, outFile, mimeType, data };
		} catch (err) {
			throw err;
		}
	});

	return function createStaticFileResource(_x8, _x9, _x10) {
		return _ref3.apply(this, arguments);
	};
})();

let compileStaticFileResource = (() => {
	var _ref4 = _asyncToGenerator(function* (readFile, writeFile, staticFileResource) {
		try {
			let staticFileBuffer = yield readFile(staticFileResource.inFile);
			return writeFile(staticFileResource.outFile, staticFileBuffer);
		} catch (err) {
			throw err;
		}
	});

	return function compileStaticFileResource(_x11, _x12, _x13) {
		return _ref4.apply(this, arguments);
	};
})();

exports.default = createStaticFileResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _createResourceProvider = require('./createResourceProvider');

var _createResourceProvider2 = _interopRequireDefault(_createResourceProvider);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createStaticFileResourceProvider(findFiles, readFile, writeFile, directory, pattern) {
	let staticFileResourceProvider = (0, _createResourceProvider2.default)(getStaticFileResources.bind(null, findFiles, readFile, directory, pattern), compileStaticFileResource.bind(null, readFile, writeFile));

	return staticFileResourceProvider;
}