'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createDebug = createDebug;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDebug(namespace) {
	return (0, _debug2.default)(`nocms:${namespace}`);
}