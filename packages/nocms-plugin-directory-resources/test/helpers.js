import minimatch from 'minimatch';
import path from 'path';
import EventEmitter from 'events';

export function createFakePluginActivationContext (inDir, outDir, fileSystem, resourceProviders) {
	async function findFiles (pattern) {
		pattern = resolveInputPath(pattern);
		let files = Object.keys(fileSystem)
			.filter(file => minimatch(file, pattern))
			.map(file => file.substr(inDir.length));

		return Promise.resolve(files);
	}

	async function readFile (file, options) {
		return Promise.resolve(fileSystem[resolveInputPath(file)]);
	}
	
	function fileExists (file) {
		let exists = fileSystem.hasOwnProperty(resolveInputPath(file));

		return exists;
	}

	function registerResourceProvider (resourceProvider) {
		resourceProviders.push(resourceProvider);
	}

	function resolveInputPath (file) {
		return path.join(inDir, file).split(path.sep).join('/');
	}

	function resolveOutputPath (file) {
		return path.join(outDir, file).split(path.sep).join('/');
	}
		
	function watchFiles (pattern) {
		return new EventEmitter();
	}

	async function writeFile (file, data, options) {
		return Promise.resolve(fileSystem[resolveOutputPath(file)] = data);
	}

	return {findFiles, fileExists, readFile, registerResourceProvider, resolveInputPath, resolveOutputPath, watchFiles, writeFile};
}