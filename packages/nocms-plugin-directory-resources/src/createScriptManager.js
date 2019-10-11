import fs from 'fs';
import { rollup  } from 'rollup';

import rollupDefaults from './rollupDefaults';

function trimNewLines(val) {
	return val
		.replace(/^\n+/, '')
		.replace(/\n+$/, '');
}

let cache;
async function rollupWithCache(options) {
	const bundle = await rollup({
		cache,
		...options
	});
	cache = bundle.cache;
	return bundle;
}

export default function createScriptManager() {
	const scriptFiles = new Set();
	const transpileScriptFiles = new Set();

	function registerScript(scriptFile, transpileFlag) {
		if(transpileFlag === true) {
			transpileScriptFiles.add(scriptFile);
		} else {
			scriptFiles.add(scriptFile);
		}
	}

	async function transpileScript(filePath){
		const { inputOptions, outputOptions } = rollupDefaults;
		inputOptions.input = filePath;

		const bundle = await rollupWithCache(inputOptions);
		const { code } = await bundle.generate(outputOptions);

		return code;
	}

	async function embedRegisteredScripts(html) {
		const transpiledScripts = await Promise.all([...transpileScriptFiles].map(transpileScript));
		const vanillaScripts = await Promise.all([...scriptFiles].map(file => fs.readFileSync(file, 'utf8')));
		const scripts = [...vanillaScripts, ...transpiledScripts];
		const scriptElements = scripts.map(script => `<script>${trimNewLines(script)}</script>`);

		return html.replace('</body>', `${scriptElements.join('')}</body>`);
	}

	return {
		registerScript,
		embedRegisteredScripts
	};
}
