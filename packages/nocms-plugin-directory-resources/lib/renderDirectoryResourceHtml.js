'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _getShortDescription = require('./getShortDescription.js');

var _getShortDescription2 = _interopRequireDefault(_getShortDescription);

var _createScriptManager = require('./createScriptManager.js');

var _createScriptManager2 = _interopRequireDefault(_createScriptManager);

var _jstransformer = require('jstransformer');

var _jstransformer2 = _interopRequireDefault(_jstransformer);

var _jstransformerMarked = require('jstransformer-marked');

var _jstransformerMarked2 = _interopRequireDefault(_jstransformerMarked);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pug = require('pug');

var _pug2 = _interopRequireDefault(_pug);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const cache = {};
const marked = (0, _jstransformer2.default)(_jstransformerMarked2.default);

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (directoryResource, { resourceTree }) {
		let pugPaths = [_path2.default.join(directoryResource.physicalPath, '_index.pug'), _path2.default.join(directoryResource.physicalPath, 'index.pug')];

		let pugPath = pugPaths.find(function (path) {
			return _fs2.default.existsSync(path);
		});

		if (!pugPath) {
			throw new Error('directory has no _index.pug or index.scss pug');
		}

		let scriptManager = (0, _createScriptManager2.default)();

		let opts = {
			plugins: [{
				read: readFile
			}],
			filters: {
				'register-script': function (text, options) {
					let { src, filename } = options;
					let scriptFile = _path2.default.resolve(_path2.default.dirname(filename), src);
					scriptManager.registerScript(scriptFile);
					return '';
				}
			}
		};
		let renderHtml = _pug2.default.compileFile(pugPath, opts);
		let locals = _extends({}, directoryResource.data, {
			current: { path: [...directoryResource.id.split('/').filter(Boolean)] },
			public: resourceTree,
			nocms: {
				renderShortDescription: function (href) {
					let sitePathBacktrack = directoryResource.id.split('/').filter(Boolean).map(d => '..').join('/');
					let sitePath = _path2.default.join(directoryResource.physicalPath, sitePathBacktrack);
					let filePath = _path2.default.join(sitePath, href);
					let file = readFile(filePath);
					let shortDescription = (0, _getShortDescription2.default)(file);
					return marked.render(shortDescription).body;
				},
				moment: _moment2.default
			}
		});

		let html = renderHtml(locals);
		html = scriptManager.embedRegisteredScripts(html);
		return html;
	});

	function renderDirectoryResourceHtml(_x, _x2) {
		return _ref.apply(this, arguments);
	}

	return renderDirectoryResourceHtml;
})();

function readFile(filename) {
	if (process.env.NODE_ENV === 'production') {
		return cache[filename] || (cache[filename] = _fs2.default.readFileSync(filename, 'utf8'));
	}
	return _fs2.default.readFileSync(filename, 'utf8');
}