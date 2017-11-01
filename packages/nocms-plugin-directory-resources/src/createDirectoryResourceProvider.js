import path from 'path';
import renderDirectoryResource from './renderDirectoryResource';
import deepmerge from 'deepmerge';

const pugFiles = ['_index.pug', 'index.pug'];
const scssFiles = ['_index.scss', 'index.scss'];
const directoryResourceGlobPattern = '**/';
const directoryResourceType = 'directory';

export default function createDirectoryResourceProvider ({findFiles, fileExists, readFile, watchFiles, writeFile, resolveInputPath}) {
	let directoryResourceCache;

	return {
		getResources: getDirectoryResources,
		compileResource: compileDirectoryResource,
		canCompileResource: canCompileDirectoryResource
	};

	async function getDirectoryResources () {
		if (!directoryResourceCache) {
			watchFiles(directoryResourceGlobPattern).on('all', handleAll);

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

	async function createDirectoryResources (directories, globals) {
		let createDirectoryResourcePromises = directories.map(directory => createDirectoryResource(directory, globals));
		
		return Promise.all(createDirectoryResourcePromises);
	}

	async function createDirectoryResource (directory, globals) {
		let id = getDirectoryResourceId(directory);
		let inDir = directory;
		let outDir = directory;
		let outFile = path.join(directory, 'index.html');
		let physicalPath = resolveInputPath(directory);
		let locals = await getData(directory);
		let data = deepmerge(globals, locals);
		let type = directoryResourceType;
		let mimeType = 'text/html';
		
		return {id, inDir, outDir, outFile, physicalPath, data, type, mimeType};
	}

	async function getDirectories ( ) {
		return findFiles(directoryResourceGlobPattern)
			.then(directories => directories.filter(directory => {
				const doesNotStartWithAnUnderscore = path.parse(directory).base[0] !== '_';
				const hasPugFile = pugFiles.some(pugFile => fileExists(path.join(directory, pugFile)));
				const hasScssFile = scssFiles.some(scssFile => fileExists(path.join(directory, scssFile)));
				
				return doesNotStartWithAnUnderscore && hasPugFile && hasScssFile;
			}));
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
		let dataJsonPath = path.join(directory, '_data.json');
		let dataJson = await readFile(dataJsonPath, 'utf8');

		return dataJson;
	}

	async function compileDirectoryResource (directoryResource, resourceCompilationContext) {
		const variants = directoryResource.data.variants || 1;

		for (let variant = 0; variant < variants; variant++) {
			const resourceCompilationContextWithVariant = {...resourceCompilationContext, variant};
			const renderedDirectoryResource = await renderDirectoryResource(directoryResource, resourceCompilationContextWithVariant);
			const outFileName = ['index', variant, 'html'].filter(Boolean).join('.');
			const outFile = path.join(directoryResource.outDir, outFileName);
			await writeFile(outFile, renderedDirectoryResource, 'utf8');
		}
	}

	function canCompileDirectoryResource (directoryResource) {
		return directoryResource.type === directoryResourceType;
	}

	function getDirectoryResourceId (directory) {
		return '/' + directory.split(path.sep).join('/');
	}

	async function getGlobals () {
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
	}

	function handleAll(event, directory) {
		if (directoryResourceCache) {
			directoryResourceCache = null;
		}
	}
}
