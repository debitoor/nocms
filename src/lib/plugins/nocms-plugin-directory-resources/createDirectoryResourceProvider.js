import path from 'path';
import renderDirectoryResource from './renderDirectoryResource';
import deepmerge from 'deepmerge';

let directoryResourceCache;

export default function createDirectoryResourceProvider ({findFiles, readFile, watchFiles, writeFile, resolveInputPath}) {
	watchFiles('**/')
		.on('all', handleAll);

	function handleAll(event, imageFile) {
		if (directoryResourceCache) {
			directoryResourceCache = null;
		}
	}

	return {
		getResources: getDirectoryResources.bind(null, findFiles, readFile, resolveInputPath),
		compileResource: compileDirectoryResource.bind(null, writeFile)
	};
}

async function getDirectoryResources (findFiles, readFile, resolveInputPath) {
	try {
		if (!directoryResourceCache) {
			let directories = await getDirectories(findFiles);
			let globals = await getGlobals(readFile);
			let directoryResources = await createDirectoryResources(readFile, resolveInputPath, directories, globals);
			directoryResourceCache = directoryResources.reduce((directoryResourceCache, directoryResource) => {
				directoryResourceCache[directoryResource.id] = directoryResource;
				return directoryResourceCache;
			}, {});
		}

		return Object.values(directoryResourceCache);
	}
	catch (err) {
		throw err;
	}
}

async function createDirectoryResources (readFile, resolveInputPath, directories, globals) {
	let createDirectoryResourcePromises = directories.map(directory => createDirectoryResource(readFile, resolveInputPath, directory, globals));
	
	return Promise.all(createDirectoryResourcePromises);
}

async function createDirectoryResource (readFile, resolveInputPath, directory, globals) {
	try {
		let id = '/' + directory.split(path.sep).join('/');
		let inDir = directory;
		let outFile = path.join(directory, 'index.html');
		let physicalPath = resolveInputPath(directory);
		let data = Object.assign({}, globals, await getData(readFile, directory));
		let mimeType = 'text/html';
		
		return {id, inDir, outFile, physicalPath, data, mimeType};
	} catch (err) {
		throw err;
	}
}

async function getDirectories (findFiles) {
	return findFiles('**/')
		.then(directories => directories.filter(directory => path.parse(directory).base[0] !== '_'));
}

async function getData (readFile, directory) {
	try {
		let dataJson = await getDataJson(readFile, directory);

		return JSON.parse(dataJson);
	} catch (err) {
		return {};
	}
}

async function getDataJson (readFile, directory) {
	try {
		let dataJsonPath = path.join(directory, '_data.json');
		let dataJson = await readFile(dataJsonPath, 'utf8');

		return dataJson;
	} catch (err) {
		throw err;
	}
}

async function compileDirectoryResource (writeFile, directoryResource, resourceCompilationContext) {
	try {
		let renderedDirectoryResource = await renderDirectoryResource(directoryResource, resourceCompilationContext);

		return writeFile(directoryResource.outFile, renderedDirectoryResource, 'utf8');
	} catch (err) {
		throw err;
	}
}

async function getGlobals (readFile) {
	try {
		let globals;
		let env = process.env.NODE_ENV || 'development';

		let defaultGlobalsJson = await  readFile('_globals.json');
		let defaultGlobals = JSON.parse(defaultGlobalsJson);

		try {
			let envGlobalsJson = await readFile(`_globals.${env}.json`);
			let envGlobals = JSON.parse(envGlobalsJson);

			globals = deepmerge(defaultGlobals, envGlobals);
		} catch (err) {
			// We do not force having env-specific _globals.json, thus just proceed if it does not exist.
			globals = defaultGlobals;
		}

		return globals;
	} catch (err) {
		throw err;
	}
}
