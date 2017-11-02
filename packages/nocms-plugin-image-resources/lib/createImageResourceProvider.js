'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createImageResourceProvider;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gm = require('gm');

var _gm2 = _interopRequireDefault(_gm);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const imageResourceType = 'image';
const imageResourceGlobPattern = '**/!(_)*.?(jpg|jpeg|png|gif)';

function createImageResourceProvider({ findFiles, readFile, watchFiles, writeFile }) {
	let getImageResources = (() => {
		var _ref = _asyncToGenerator(function* () {
			try {
				if (!imageResourceCache) {
					let imageFiles = yield getImageFiles(findFiles);
					let imageResources = yield createImageResources(readFile, imageFiles);
					imageResourceCache = imageResources.reduce(function (imageResourceCache, imageResource) {
						imageResourceCache[imageResource.id] = imageResource;
						return imageResourceCache;
					}, {});
				}

				return Object.values(imageResourceCache);
			} catch (err) {
				throw err;
			}
		});

		return function getImageResources() {
			return _ref.apply(this, arguments);
		};
	})();

	let createImageResources = (() => {
		var _ref2 = _asyncToGenerator(function* (readFile, imageFiles) {
			let createImageResourcePromises = imageFiles.map(function (imageFile) {
				return createImageResource(readFile, imageFile);
			});

			return Promise.all(createImageResourcePromises);
		});

		return function createImageResources(_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	})();

	let createImageResource = (() => {
		var _ref3 = _asyncToGenerator(function* (readFile, imageFile) {
			try {
				let id = createImageResourceId(imageFile);
				let inFile = imageFile;
				let outFile = imageFile;
				let data = yield getImageData(readFile, imageFile);
				let mimeType = _mime2.default.lookup(id);

				return { id, inFile, outFile, data, mimeType };
			} catch (err) {
				throw err;
			}
		});

		return function createImageResource(_x3, _x4) {
			return _ref3.apply(this, arguments);
		};
	})();

	let getImageData = (() => {
		var _ref4 = _asyncToGenerator(function* (readFile, imageFile) {
			try {
				let imageBuffer = yield readFile(imageFile);
				let imageSize = yield getImageSize(imageBuffer);

				return { size: imageSize };
			} catch (err) {
				throw err;
			}
		});

		return function getImageData(_x5, _x6) {
			return _ref4.apply(this, arguments);
		};
	})();

	let getImageSize = (() => {
		var _ref5 = _asyncToGenerator(function* (imageBuffer) {
			return new Promise(function (resolve) {
				(0, _gm2.default)(imageBuffer).size(function (err, size) {
					if (err) {
						resolve();
					}

					resolve(size);
				});
			});
		});

		return function getImageSize(_x7) {
			return _ref5.apply(this, arguments);
		};
	})();

	let compileImageResource = (() => {
		var _ref6 = _asyncToGenerator(function* (imageResource) {
			try {
				let imageBuffer = yield readFile(imageResource.inFile);

				return writeFile(imageResource.outFile, imageBuffer);
			} catch (err) {
				throw err;
			}
		});

		return function compileImageResource(_x8) {
			return _ref6.apply(this, arguments);
		};
	})();

	let getImageFiles = (() => {
		var _ref7 = _asyncToGenerator(function* (findFiles) {
			return findFiles(imageResourceGlobPattern);
		});

		return function getImageFiles(_x9) {
			return _ref7.apply(this, arguments);
		};
	})();

	let imageResourceCache;

	return {
		getResources: getImageResources,
		compileResource: compileImageResource,
		canCompileResource: canCompileImageResource,
		watchResources: watchImageResources
	};

	function watchImageResources(onChange) {
		watchFiles(imageResourceGlobPattern).on('all', (event, imageFile) => {
			if (imageResourceCache) {
				switch (event) {
					case 'add':
					case 'change':
						createImageResource(readFile, imageFile).then(imageResource => imageResourceCache[imageResource.id] = imageResource);
						break;
					case 'unlink':
						let imageResourceId = createImageResourceId(imageFile);
						delete imageResourceCache[imageResourceId];
						break;
				}
			}

			onChange();
		});
	}

	function canCompileImageResource(imageResource) {
		return imageResource.type === imageResourceType;
	}

	function createImageResourceId(imageFile) {
		return '/' + imageFile.split(_path2.default.sep).join('/');
	}
}