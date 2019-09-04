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
	const scriptsFiles = new Set();

	function registerScript(scriptFile) {
		scriptsFiles.add(scriptFile);
	}

	async function transpileScript(filePath){
		let { inputOptions, outputOptions } = rollupDefaults;
		inputOptions.input = filePath;

		const bundle = await rollupWithCache(inputOptions);
		const { code } = await bundle.generate(outputOptions);

		return code;
	}

	async function embedRegisteredScripts(html) {
		const scripts = await Promise.all([...scriptsFiles].map(file => transpileScript(file)));
		const scriptElements = scripts.map(script => `<script>${trimNewLines(script)}</script>`);

		return html.replace('</body>', `${scriptElements.join('')}</body>`);
	}

	return {
		registerScript,
		embedRegisteredScripts
	};
}
