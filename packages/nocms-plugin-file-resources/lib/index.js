'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createFileResourceProvider = require('./createFileResourceProvider');

var _createFileResourceProvider2 = _interopRequireDefault(_createFileResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, configFile }) {

	let fileResourceProvider;
	let sharedFileResourceProvider;
	let sharedFaviconFileResourceProviderc;

	let fileConfig = configFile.config.plugins['file-resources'].providers[0];
	let sharedConfig = configFile.config.plugins['file-resources'].providers[1];
	let faviconConfig = configFile.config.plugins['file-resources'].providers[2];

	fileResourceProvider = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, fileConfig.path, fileConfig.glob);
	sharedFileResourceProvider = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, sharedConfig.path, sharedConfig.glob);
	sharedFaviconFileResourceProviderc = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, faviconConfig.path, faviconConfig.glob);

	registerResourceProvider(fileResourceProvider);
	registerResourceProvider(sharedFileResourceProvider);
	registerResourceProvider(sharedFaviconFileResourceProviderc);
}