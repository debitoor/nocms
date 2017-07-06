import fs from 'fs';
import getShortDescription from './getShortDescription.js';
import createScriptManager from './createScriptManager.js';
import jstransformer from 'jstransformer';
import jstransformerMarked from 'jstransformer-marked';
import path from 'path';
import pug from 'pug';
import moment from 'moment';

const cache = {};
const marked = jstransformer(jstransformerMarked);

export default async function renderDirectoryResourceHtml(directoryResource, {resourceTree}) {
	let pugPaths = [
		path.join(directoryResource.physicalPath, '_index.pug'),
		path.join(directoryResource.physicalPath, 'index.pug')
	];

	let pugPath = pugPaths.find(path => fs.existsSync(path));

	if (!pugPath){
		throw new Error('directory has no _index.pug or index.scss pug');
	}

	let scriptManager = createScriptManager();
	
	let opts = {
		plugins: [{
			read: readFile
		}],
		filters: {
			'register-script': function (text, options) {
				let {src, filename} = options;
				let scriptFile =  path.resolve(path.dirname(filename), src);
				scriptManager.registerScript(scriptFile);
				return '';
			}
		}
	};
	let renderHtml = pug.compileFile(pugPath, opts);
	let locals = {
		...directoryResource.data,
		current: {path: [...directoryResource.id.split('/').filter(Boolean)]},
		public: resourceTree,
		nocms: {
			renderShortDescription: function(href) {
				let sitePathBacktrack = directoryResource.id.split('/').filter(Boolean).map(d => '..').join('/');
				let sitePath = path.join(directoryResource.physicalPath, sitePathBacktrack);
				let filePath = path.join(sitePath, href);
				let file = readFile(filePath);
				let shortDescription = getShortDescription(file);
				return marked.render(shortDescription).body;
			},
			moment
		}
	};

	let html = renderHtml(locals);
	html = scriptManager.embedRegisteredScripts(html);
	return html;
}

function readFile(filename) {
	if (process.env.NODE_ENV === 'production') {
		return cache[filename] || (cache[filename] = fs.readFileSync(filename, 'utf8'));
	}
	return fs.readFileSync(filename, 'utf8');
}
