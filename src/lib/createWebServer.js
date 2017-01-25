import express from 'express';
import url from 'url';

export default function createWebServer ({
	resolveOutputPath,
	resourceProvider,
	commandSender,
	port
}) {
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
			
			await commandSender.sendCommand({
				id: ++count,
				name: 'compileResource',
				params: {resourceId}
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
