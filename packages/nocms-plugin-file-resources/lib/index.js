'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createFileResourceProvider = require('./createFileResourceProvider');

var _createFileResourceProvider2 = _interopRequireDefault(_createFileResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, config }) {
	console.log(registerResourceProvider);

	console.log('Config: ', config);

	const fileResourceProvider = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, './', '**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const sharedFileResourceProvider = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, '../../', 'shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const sharedFaviconFileResourceProviderc = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, '../../shared/favicon', '*');

	registerResourceProvider(fileResourceProvider);
	registerResourceProvider(sharedFileResourceProvider);
	registerResourceProvider(sharedFaviconFileResourceProviderc);
}