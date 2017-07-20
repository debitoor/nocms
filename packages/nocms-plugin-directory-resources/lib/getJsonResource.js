'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getGlobals = exports.getLocals = undefined;

let getLocals = exports.getLocals = (() => {
	var _ref = _asyncToGenerator(function* (directory, readFile) {
		let getLocalsJson = (() => {
			var _ref2 = _asyncToGenerator(function* () {
				try {
					let dataJsonPath = _path2.default.join(directory, '_data.json');
					let dataJson = yield readFile(dataJsonPath, 'utf8');

					return dataJson;
				} catch (err) {
					throw err;
				}
			});

			return function getLocalsJson() {
				return _ref2.apply(this, arguments);
			};
		})();

		try {
			let dataJson = yield getLocalsJson();

			return JSON.parse(dataJson);
		} catch (err) {
			return {};
		}
	});

	return function getLocals(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

let getGlobals = exports.getGlobals = (() => {
	var _ref3 = _asyncToGenerator(function* (readFile) {
		try {
			let globals;
			let env = process.env.NODE_ENV || 'development';

			let defaultGlobalsJson = yield readFile('_globals.json');
			let defaultGlobals = JSON.parse(defaultGlobalsJson);

			try {
				let envGlobalsJson = yield readFile(`_globals.${env}.json`);
				let envGlobals = JSON.parse(envGlobalsJson);

				globals = (0, _deepmerge2.default)(defaultGlobals, envGlobals);
			} catch (err) {
				// We do not force having env-specific _globals.json, thus just proceed if it does not exist.
				globals = defaultGlobals;
			}

			return globals;
		} catch (err) {
			throw err;
		}
	});

	return function getGlobals(_x3) {
		return _ref3.apply(this, arguments);
	};
})();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }