import express from 'express';
import url from 'url';
import {createDebug} from './debug';

const debug = createDebug('server');

export function createServer ({resolveOutputPath, resourceProvider, commandSender, port}) {
	debug('createServer()');

	const app = express();
	let count = 0;
	
	app.get('/*', async (req, res, next) => {
		try {
			const resourceId = url.parse(req.url).pathname;
			const resources = await resourceProvider.getResources();
			const resource = resources.find(resource => resource.id === resourceId);

			if (!resource) {
				throw new Error('Resource Not Found');
			}

			const variant = parseInt(req.query.variant) || 0;
			let outFile = resource.outFile;

			if (variant > 0) {
				const parts = outFile.split('.');
				parts.splice(-1, 0, variant);
				outFile = parts.filter(Boolean).join('.');
			}

			await commandSender.sendCommand({
				id: ++count,
				name: 'compileResource',
				params: {resourceId}
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

	app.listen(port, () => {
		console.info(`listening on port ${port}`);
	});
}