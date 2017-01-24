'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = fileExists;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fileExists(file) {
	return _fs2.default.existsSync(file);
}