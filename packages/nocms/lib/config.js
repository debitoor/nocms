'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _cosmiconfig = require('cosmiconfig');

var _cosmiconfig2 = _interopRequireDefault(_cosmiconfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* () {
		try {
			let opts = { 'rcExtensions': true };

			let explorer = (0, _cosmiconfig2.default)('nocms', opts);

			return explorer.load('./').then(function (configFile) {
				if (configFile === null) {
					console.error('Config file not found.');
					return configFile;
				} else {
					return configFile.config;
				}
			}).catch(function (err) {
				console.error(err);
			});
		} catch (error) {
			console.error(error);
		}
	});

	function loadConfig() {
		return _ref.apply(this, arguments);
	}

	return loadConfig;
})();