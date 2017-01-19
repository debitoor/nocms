'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (pattern, options) {
		return new Promise(function (resolve, reject) {
			(0, _glob2.default)(pattern, options, function (err, files) {
				if (err) {
					return reject(err);
				}

				resolve(files);
			});
		});
	});

	function findFilesAsync(_x, _x2) {
		return _ref.apply(this, arguments);
	}

	return findFilesAsync;
})();