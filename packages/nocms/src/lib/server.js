import express from 'express';
import url from 'url';
import {createDebug} from './debug';
import {newCommandId} from './commands';
import http from 'http';

const debug = createDebug('server');

export async function createServer ({resolveOutputPath, resourceProvider, commandSender, port}) {
	debug('createServer()');

	let resources;

	const app = express();

	app.get('/*', async (req, res, next) => {
		try {
			const pathName = url.parse(req.url).pathname;
			const {resourceId, variant} = parseUrlPathName(pathName);

			if (!resources) {
				resources = await resourceProvider.getResources();
			}

			const resource = resources.find(resource => resource.id === resourceId);

			if (!resource) {
				throw new Error('Resource Not Found');
			}

			let outFile = resource.outFile;

			if (variant > 0) {
				const parts = outFile.split('.');
				parts.splice(-1, 0, variant);
				outFile = parts.filter(Boolean).join('.');
			}

			await commandSender.sendCommand({
				id: newCommandId(),
				type: 'compileResource',
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

			res.json(err);
		}
	});

	const server = http.createServer(app);

	server.listen(port);
	server.on('listening', () => console.log(`Listening on port ${port}`));
	server.on('error', onServerError);

	resourceProvider.watchResources(() => {

		resourceProvider.getResources().then(newResources => {
			resources = newResources;

			commandSender.sendCommandAll({
				id: newCommandId(),
				type: 'updateResources',
				params: {resources: newResources}
			});
		});
	});
}

function onServerError(error) {
	if (error.code === 'EADDRINUSE') {
		console.error(`A process is already running on port ${error.port}. Please close any other process running on this port and try again.`);
		process.exit(1);
	}
	throw error;
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
