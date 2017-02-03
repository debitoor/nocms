'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _renderDirectoryResourceCss = require('./renderDirectoryResourceCss');

var _renderDirectoryResourceCss2 = _interopRequireDefault(_renderDirectoryResourceCss);

var _renderDirectoryResourceHtml = require('./renderDirectoryResourceHtml');

var _renderDirectoryResourceHtml2 = _interopRequireDefault(_renderDirectoryResourceHtml);

var _cssBingo = require('css-bingo');

var _cssBingo2 = _interopRequireDefault(_cssBingo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (directoryResource, resources) {
		try {
			let css = yield (0, _renderDirectoryResourceCss2.default)(directoryResource);
			let html = yield (0, _renderDirectoryResourceHtml2.default)(directoryResource, resources);
			let processedCss = (0, _cssBingo2.default)(css, html);
			let htmlWithPurifiedCssEmbedded = embedCssInHtml(processedCss, html);

			return htmlWithPurifiedCssEmbedded;
		} catch (err) {
			throw err;
		}
	});

	function renderDirectoryResource(_x, _x2) {
		return _ref.apply(this, arguments);
	}

	return renderDirectoryResource;
})();

function embedCssInHtml(css, html) {
	return html.replace('</head>', `<style>${css}</style></head>`);
}