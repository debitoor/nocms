'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (file, data, options) {
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

	function writeFileAsync(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	}

	return writeFileAsync;
})();