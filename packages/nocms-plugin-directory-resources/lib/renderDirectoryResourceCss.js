'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

let renderScssAsync = (() => {
	var _ref2 = _asyncToGenerator(function* (file) {
		return new Promise(function (resolve) {
			_nodeSass2.default.render({ file }, function (err, result) {
				if (err) {
					throw err;
				}

				let css = result.css.toString();

				resolve(css);
			});
		});
	});

	return function renderScssAsync(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (directoryResource) {
		try {
			let scssPaths = [_path2.default.join(directoryResource.physicalPath, '_index.scss'), _path2.default.join(directoryResource.physicalPath, 'index.scss')];

			let scssPath = scssPaths.find(function (path) {
				return _fs2.default.existsSync(path);
			});

			if (!scssPath) {
				return '';
			}

			let css = yield renderScssAsync(scssPath);

			return css;
		} catch (err) {
			throw err;
		}
	});

	function renderDirectoryResourceCss(_x) {
		return _ref.apply(this, arguments);
	}

	return renderDirectoryResourceCss;
})();