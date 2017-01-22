'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createFileResourceProvider = require('./createFileResourceProvider');

var _createFileResourceProvider2 = _interopRequireDefault(_createFileResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile }) {
	const a = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, './', '**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const b = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, '../../', 'shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const c = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, '../../shared/favicon', '*');

	registerResourceProvider(a);
	registerResourceProvider(b);
	registerResourceProvider(c);
}