'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createPluginActivationContext;

var _fileExists = require('./fileExists');

var _fileExists2 = _interopRequireDefault(_fileExists);

var _findFilesAsync = require('./findFilesAsync');

var _findFilesAsync2 = _interopRequireDefault(_findFilesAsync);

var _readFileAsync = require('./readFileAsync');

var _readFileAsync2 = _interopRequireDefault(_readFileAsync);

var _watchFiles = require('./watchFiles');

var _watchFiles2 = _interopRequireDefault(_watchFiles);

var _writeFileAsync = require('./writeFileAsync');

var _writeFileAsync2 = _interopRequireDefault(_writeFileAsync);

var _createDirectoryBoundFileExists = require('./createDirectoryBoundFileExists');

var _createDirectoryBoundFileExists2 = _interopRequireDefault(_createDirectoryBoundFileExists);

var _createDirectoryBoundFindFilesAsync = require('./createDirectoryBoundFindFilesAsync');

var _createDirectoryBoundFindFilesAsync2 = _interopRequireDefault(_createDirectoryBoundFindFilesAsync);

var _createDirectoryBoundReadFileAsync = require('./createDirectoryBoundReadFileAsync');

var _createDirectoryBoundReadFileAsync2 = _interopRequireDefault(_createDirectoryBoundReadFileAsync);

var _createDirectoryBoundResolvePath = require('./createDirectoryBoundResolvePath');

var _createDirectoryBoundResolvePath2 = _interopRequireDefault(_createDirectoryBoundResolvePath);

var _createDirectoryBoundWatchFiles = require('./createDirectoryBoundWatchFiles');

var _createDirectoryBoundWatchFiles2 = _interopRequireDefault(_createDirectoryBoundWatchFiles);

var _createDirectoryBoundWriteFileAsync = require('./createDirectoryBoundWriteFileAsync');

var _createDirectoryBoundWriteFileAsync2 = _interopRequireDefault(_createDirectoryBoundWriteFileAsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPluginActivationContext(inDir, outDir, registerResourceProvider) {
	return {
		registerResourceProvider,
		fileExists: (0, _createDirectoryBoundFileExists2.default)(_fileExists2.default, inDir),
		findFiles: (0, _createDirectoryBoundFindFilesAsync2.default)(_findFilesAsync2.default, inDir),
		readFile: (0, _createDirectoryBoundReadFileAsync2.default)(_readFileAsync2.default, inDir),
		watchFiles: (0, _createDirectoryBoundWatchFiles2.default)(_watchFiles2.default, inDir),
		writeFile: (0, _createDirectoryBoundWriteFileAsync2.default)(_writeFileAsync2.default, outDir),
		resolveInputPath: (0, _createDirectoryBoundResolvePath2.default)(inDir),
		resolveOutputPath: (0, _createDirectoryBoundResolvePath2.default)(outDir)
	};
}