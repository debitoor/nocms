import path from 'path';
import renderDirectoryResource from './renderDirectoryResource';
import deepmerge from 'deepmerge';

export default function createDirectoryResourceProvider ({findFiles, readFile, watchFiles, writeFile, resolveInputPath}) {
	const pattern = '**/';
	let directoryResourceCache;

	watchFiles('**/')
		.on('all', handleAll);

	function handleAll(event, directory) {
		if (directoryResourceCache) {
			directoryResourceCache = null;
		}
	}

	return {
		getResources: getDirectoryResources,
		compileResource: compileDirectoryResource
	};

	async function getDirectoryResources () {
		try {
			if (!directoryResourceCache) {
				let directories = await getDirectories();
				let globals = await getGlobals();
				let directoryResources = await createDirectoryResources(directories, globals);
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

	async function createDirectoryResources (directories, globals) {
		let createDirectoryResourcePromises = directories.map(directory => createDirectoryResource(directory, globals));
		
		return Promise.all(createDirectoryResourcePromises);
	}

	async function createDirectoryResource (directory, globals) {
		try {
			let id = getDirectoryResourceId(directory);
			let inDir = directory;
			let outFile = path.join(directory, 'index.html');
			let physicalPath = resolveInputPath(directory);
			let data = Object.assign({}, globals, await getData(directory));
			let mimeType = 'text/html';
			
			return {id, inDir, outFile, physicalPath, data, mimeType};
		} catch (err) {
			throw err;
		}
	}

	async function getDirectories ( ) {
		return findFiles(pattern)
			.then(directories => directories.filter(directory => path.parse(directory).base[0] !== '_'));
	}

	async function getData (directory) {
		try {
			let dataJson = await getDataJson(directory);

			return JSON.parse(dataJson);
		} catch (err) {
			return {};
		}
	}

	async function getDataJson (directory) {
		try {
			let dataJsonPath = path.join(directory, '_data.json');
			let dataJson = await readFile(dataJsonPath, 'utf8');

			return dataJson;
		} catch (err) {
			throw err;
		}
	}

	async function compileDirectoryResource (directoryResource, resourceCompilationContext) {
		try {
			let renderedDirectoryResource = await renderDirectoryResource(directoryResource, resourceCompilationContext);

			return writeFile(directoryResource.outFile, renderedDirectoryResource, 'utf8');
		} catch (err) {
			throw err;
		}
	}

	function getDirectoryResourceId (directory) {
		return '/' + directory.split(path.sep).join('/');
	}

	async function getGlobals () {
		try {
			let globals;
			let env = process.env.NODE_ENV || 'development';

			let defaultGlobalsJson = await readFile('_globals.json');
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

}