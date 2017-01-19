'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (file, options) {
		return new Promise(function (resolve, reject) {
			_fs2.default.readFile(file, options, function (err, data) {
				if (err) {
					return reject(err);
				}

				resolve(data);
			});
		});
	});

	function readFileAsync(_x, _x2) {
		return _ref.apply(this, arguments);
	}

	return readFileAsync;
})();