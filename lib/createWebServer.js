'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createWebServer;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createWebServer({
	resolveOutputPath,
	resourceProvider,
	commandSender,
	port
}) {
	const app = (0, _express2.default)();
	let count = 0;

	app.get('/*', (() => {
		var _ref = _asyncToGenerator(function* (req, res, next) {
			try {
				const resourceId = req.url;
				const resources = yield resourceProvider.getResources();
				const resource = resources.find(function (resource) {
					return resource.id === resourceId;
				});

				if (!resource) {
					throw new Error('Resource Not Found');
				}

				yield commandSender.sendCommand({
					id: ++count,
					name: 'compileResource',
					params: { resourceId }
				});

				res.setHeader('Content-Type', resource.mimeType);
				res.statusCode = 200;
				res.sendFile(resolveOutputPath(resource.outFile));
			} catch (err) {
				if (err.message === 'Resource Not Found') {
					res.statusCode = 404;
				} else {
					res.statusCode = 500;
				}

				res.write(err.message);
				res.end();
			}
		});

		return function (_x, _x2, _x3) {
			return _ref.apply(this, arguments);
		};
	})());

	app.listen(port, () => {
		console.info(`listening on port ${ port }`);
	});
}