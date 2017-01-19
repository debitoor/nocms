'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (directory) {
		return new Promise(function (resolve) {
			_fsExtra2.default.emptyDir(directory, function (err) {
				if (err) {
					throw err;
				}

				resolve();
			});
		});
	});

	function cleanDirectoryAsync(_x) {
		return _ref.apply(this, arguments);
	}

	return cleanDirectoryAsync;
})();