'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createImageResourceProvider = require('./createImageResourceProvider');

var _createImageResourceProvider2 = _interopRequireDefault(_createImageResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ createResourceProvider, registerResourceProvider, findFiles, readFile, watchFiles, writeFile }) {
	const imageResourceProvider = (0, _createImageResourceProvider2.default)({ findFiles, readFile, watchFiles, writeFile });

	registerResourceProvider(imageResourceProvider);
}