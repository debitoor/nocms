'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createServer = createServer;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _debug = require('./debug');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug.createDebug)('server');

function createServer({ resolveOutputPath, resourceProvider, commandSender, port }) {
	debug('createServer()');

	const app = (0, _express2.default)();
	let count = 0;

	app.get('/*', (() => {
		var _ref = _asyncToGenerator(function* (req, res, next) {
			try {
				const pathName = _url2.default.parse(req.url).pathname;
				const { resourceId, variant } = parseUrlPathName(pathName);
				const resources = yield resourceProvider.getResources();
				const resource = resources.find(function (resource) {
					return resource.id === resourceId;
				});

				if (!resource) {
					throw new Error('Resource Not Found');
				}

				let outFile = resource.outFile;

				if (variant > 0) {
					const parts = outFile.split('.');
					parts.splice(-1, 0, variant);
					outFile = parts.filter(Boolean).join('.');
				}

				yield commandSender.sendCommand({
					id: ++count,
					name: 'compileResource',
					params: { resourceId }
				});

				res.setHeader('Content-Type', resource.mimeType);
				res.statusCode = 200;
				res.sendFile(resolveOutputPath(outFile));
			} catch (err) {
				if (err.message === 'Resource Not Found') {
					res.statusCode = 404;
				} else {
					res.statusCode = 500;
				}

				if (err.message) {
					res.write(err.message);
				}
				res.end();
			}
		});

		return function (_x, _x2, _x3) {
			return _ref.apply(this, arguments);
		};
	})());

	app.listen(port, () => {
		console.info(`listening on port ${port}`);
	});
}

function parseUrlPathName(pathName) {
	let resourceId, variant;
	let lastIndexOfDot = pathName.lastIndexOf('.');
	let variantCandidate = pathName.substr(lastIndexOfDot + 1);
	let variantCandidateAsInt = parseInt(variantCandidate);

	if (variantCandidateAsInt) {
		resourceId = pathName.substr(0, lastIndexOfDot);
		variant = variantCandidateAsInt;
	} else {
		resourceId = pathName;
		variant = 0;
	}

	return { resourceId, variant };
}