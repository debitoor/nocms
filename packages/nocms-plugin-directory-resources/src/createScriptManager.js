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

	function registerScript(scriptFile) {
		scriptFiles.add(scriptFile);
	}

	async function transpileScript(filePath){
		let { inputOptions, outputOptions } = rollupDefaults;
		inputOptions.input = filePath;

		const bundle = await rollupWithCache(inputOptions);
		const { code } = await bundle.generate(outputOptions);

		return code;
	}

	async function embedRegisteredScripts(html) {
		const scripts = await Promise.all([...scriptFiles].map(transpileScript));
		const scriptElements = scripts.map(script => `<script>${trimNewLines(script)}</script>`);

		return html.replace('</body>', `${scriptElements.join('')}</body>`);
	}

	return {
		registerScript,
		embedRegisteredScripts
	};
}
