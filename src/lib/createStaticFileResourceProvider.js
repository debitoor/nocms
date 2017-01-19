import path from 'path';
import createResourceProvider from './createResourceProvider';
import mime from 'mime';

export default function createStaticFileResourceProvider (findFiles, readFile, writeFile, directory, pattern) {
	let staticFileResourceProvider = createResourceProvider(
		getStaticFileResources.bind(null, findFiles, readFile, directory, pattern),
		compileStaticFileResource.bind(null, readFile, writeFile)
	);

	return staticFileResourceProvider;
}

async function getStaticFileResources (findFiles, readFile, directory, pattern) {
	try {
		let newPath = path.posix.join(directory, pattern);
		let staticFiles = await findFiles(newPath);
		let staticFileResources = await createStaticFileResources(readFile, staticFiles, directory);

		return staticFileResources;
	}
	catch (err) {
		throw err;
	}
}

async function createStaticFileResources (readFile, staticFiles, directory) {
	let createStaticFileResourcePromises = staticFiles.map(staticFile => createStaticFileResource(readFile, staticFile, directory));
	
	return Promise.all(createStaticFileResourcePromises);
}

async function createStaticFileResource (readFile, staticFile, directory) {
	try {
		let newPath = path.relative(directory, staticFile);
		let id = '/' + newPath.split(path.sep).join('/');
		let outFile = newPath.split(path.sep).join(path.sep);
		let inFile = staticFile;
		
		let data = {};
		let mimeType = mime.lookup(id);

		return {id, inFile, outFile, mimeType, data};
	} catch (err) {
		throw err;
	}
}

async function compileStaticFileResource (readFile, writeFile, staticFileResource) {
	try {
		let staticFileBuffer = await readFile(staticFileResource.inFile);
		return writeFile(staticFileResource.outFile, staticFileBuffer);
	} catch (err) {
		throw err;
	}
}