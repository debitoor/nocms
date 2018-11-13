import { rollup  } from 'rollup';
import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import fs from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import path from 'path';
import replace from 'rollup-plugin-replace';

let cache;

async function rollupWithCache(options) {
	const bundle = await rollup({
		cache,
		...options
	});
	cache = bundle.cache;
	return bundle;
}

export default async function renderDirectoryResourceJs(directoryResource) {
	const jsPaths = [
		path.join(directoryResource.physicalPath, '_index.js'),
		path.join(directoryResource.physicalPath, 'index.js')
	];

	const jsPath = jsPaths.find(path => fs.existsSync(path));

	if (!jsPath){
		throw new Error('directory has no _index.js or index.js');
	}

	const inputOptions = {
		input: jsPath,
		plugins: [
			babel(),
			nodeResolve({
				jsnext: false,
				main: true
			}),
			commonjs({
				include: 'node_modules/**'
			}),
			replace({
				'process.env.NODE_ENV': JSON.stringify('production')
			}),
			uglify()
		]
	};

	const outputOptions = {
		format: 'iife'
	};

	const bundle = await rollupWithCache(inputOptions);
	const { code } = await bundle.generate(outputOptions);

	return trimNewLines(code);
}

function trimNewLines(val) {
	return val
		.replace(/^\n+/, '')
		.replace(/\n+$/, '');
}