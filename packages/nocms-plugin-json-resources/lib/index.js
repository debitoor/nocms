'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createJsonResourceProvider = require('./createJsonResourceProvider');

var _createJsonResourceProvider2 = _interopRequireDefault(_createJsonResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ createResourceProvider, registerResourceProvider, findFiles, readFile, watchFiles, writeFile }) {
	const jsonResourceProvider = (0, _createJsonResourceProvider2.default)({ findFiles, readFile, watchFiles, writeFile });

	registerResourceProvider(jsonResourceProvider);
}