'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createScriptManager;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createScriptManager() {
	const scriptsFiles = new Set();

	function registerScript(scriptFile) {
		scriptsFiles.add(scriptFile);
	}

	function embedRegisteredScripts(html) {
		const scripts = [...scriptsFiles].map(file => _fs2.default.readFileSync(file, 'utf8'));
		const scriptElements = scripts.map(script => `<script>${script}</script>`);

		return html.replace('</body>', `${scriptElements.join()}</body>`);
	}

	return {
		registerScript,
		embedRegisteredScripts
	};
}