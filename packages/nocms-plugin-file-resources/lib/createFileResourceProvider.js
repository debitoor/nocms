'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createFileResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fileResourceType = 'file';

function createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, directory, pattern) {
	let getFileResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			if (!fileResourceCache) {
				watchFiles(pattern).on('all', handleAll);

				let files = yield findFiles(pattern);
				let fileResources = yield createFileResources(files);

				fileResourceCache = fileResources.reduce(function (fileResourceCache, fileResource) {
					fileResourceCache[fileResource.id] = fileResource;
					return fileResourceCache;
				}, {});
			}

			return Object.values(fileResourceCache);
		});

		return function getFileResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let createFileResources = (() => {
		var _ref2 = _asyncToGenerator(function* (files) {
			let createFileResourcePromises = files.map(function (file) {
				return createFileResource(file);
			});

			return Promise.all(createFileResourcePromises);
		});

		return function createFileResources(_x) {
			return _ref2.apply(this, arguments);
		};
	})();

	let createFileResource = (() => {
		var _ref3 = _asyncToGenerator(function* (file) {
			let newPath = _path2.default.relative(directory, file);
			let id = createFileResourceId(newPath);
			let outFile = newPath;
			let inFile = file;
			let data = {};
			let type = fileResourceType;
			let mimeType = _mime2.default.lookup(id);

			return { id, inFile, outFile, mimeType, type, data };
		});

		return function createFileResource(_x2) {
			return _ref3.apply(this, arguments);
		};
	})();

	let compileFileResource = (() => {
		var _ref4 = _asyncToGenerator(function* (fileResource) {
			let fileBuffer = yield readFile(fileResource.inFile);

			return writeFile(fileResource.outFile, fileBuffer);
		});

		return function compileFileResource(_x3) {
			return _ref4.apply(this, arguments);
		};
	})();

	pattern = _path2.default.posix.join(directory, pattern);
	let fileResourceCache;

	return {
		getResources: getFileResources,
		compileResource: compileFileResource,
		canCompileResource: canCompileFileResource
	};

	function handleAll(event, file) {
		if (fileResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createFileResource(file).then(fileResource => fileResourceCache[fileResource.id] = fileResource);
					break;
				case 'unlink':
					let fileResourceId = createFileResourceId(file);
					delete fileResourceCache[fileResourceId];
					break;
			}
		}
	}

	function canCompileFileResource(fileResource) {
		return fileResource.type === fileResourceType;
	}

	function createFileResourceId(file) {
		return ['', ...file.split(_path2.default.sep)].join('/');
	}
}