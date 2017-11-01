'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.newCommandId = newCommandId;

var _uuid = require('uuid');

function newCommandId() {
	return (0, _uuid.v4)();
}