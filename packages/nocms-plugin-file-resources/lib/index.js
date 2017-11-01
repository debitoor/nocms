'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.activate = activate;

var _createFileResourceProvider = require('./createFileResourceProvider');

var _createFileResourceProvider2 = _interopRequireDefault(_createFileResourceProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, config }) {
	if (config === null) {
		return;
	}

	const providers = config.plugins['file-resources'].providers;

	for (let i = 0; i < providers.length; i++) {
		const providerConfig = providers[i];
		const fileResourceProvider = (0, _createFileResourceProvider2.default)(findFiles, readFile, watchFiles, writeFile, providerConfig.path, providerConfig.glob);
		registerResourceProvider(fileResourceProvider);
	}
}