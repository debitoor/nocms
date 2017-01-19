'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _findFilesAsync = require('./findFilesAsync.js');

var _findFilesAsync2 = _interopRequireDefault(_findFilesAsync);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (pluginActivationContext) {
		let pluginsPattern = _path2.default.join(__dirname, 'plugins/nocms-plugin-*/');

		return (0, _findFilesAsync2.default)(pluginsPattern).then(function (pluginDirectories) {
			return pluginDirectories.map(function (pluginsDirectory) {
				return require(pluginsDirectory);
			});
		}).then(function (plugins) {
			plugins.forEach(function (plugin) {
				return plugin.activate(pluginActivationContext);
			});
		});
	});

	function loadPlugins(_x) {
		return _ref.apply(this, arguments);
	}

	return loadPlugins;
})();