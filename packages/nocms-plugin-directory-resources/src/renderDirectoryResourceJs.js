import { rollup  } from 'rollup';
import fs from 'fs';
import path from 'path';
import rollupDefaults from './rollupDefaults';

let cache;

async function rollupWithCache(options) {
	const bundle = await rollup({
		cache,
		...options
	});
	cache = bundle.cache;
	return bundle;
}

/**
 *
 * @param {*} directoryResource
 */
export default async function renderDirectoryResourceJs(directoryResource) {
	const jsPaths = [
		path.join(directoryResource.physicalPath, '_index.js'),
		path.join(directoryResource.physicalPath, 'index.js')
	];

	const jsPath = jsPaths.find(path => fs.existsSync(path));

	if (!jsPath) {
		return '';
	}

	let { inputOptions, outputOptions } = rollupDefaults;
	inputOptions.input = jsPath;

	const bundle = await rollupWithCache(inputOptions);
	const { code } = await bundle.generate(outputOptions);

	return trimNewLines(code);
}

function trimNewLines(val) {
	return val
		.replace(/^\n+/, '')
		.replace(/\n+$/, '');
}
