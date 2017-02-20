import fs from 'fs';

export default function createScriptManager() {
	const scriptsFiles = new Set();

	function registerScript(scriptFile) {
		scriptsFiles.add(scriptFile);
	}

	function embedRegisteredScripts(html) {
		const scripts = [...scriptsFiles].map(file => fs.readFileSync(file, 'utf8'));
		const scriptElements = scripts.map(script => `<script>${script}</script>`);

		return html.replace('</body>', `${scriptElements.join('')}</body>`);
	}

	return {
		registerScript,
		embedRegisteredScripts
	};
}
