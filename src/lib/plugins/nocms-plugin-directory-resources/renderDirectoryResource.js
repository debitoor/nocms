import renderDirectoryResourceCss from './renderDirectoryResourceCss';
import renderDirectoryResourceHtml from './renderDirectoryResourceHtml';
import purifyCss from 'purify-css';

export default async function renderDirectoryResource(directoryResource, resources) {
	try {
		let css = await renderDirectoryResourceCss(directoryResource);
		let html = await renderDirectoryResourceHtml(directoryResource, resources);
		let purifiedCss = purifyCss(html, css, {minify: true});
		let htmlWithPurifiedCssEmbedded = embedCssInHtml(purifiedCss, html);

		return htmlWithPurifiedCssEmbedded;
	} catch (err) {
		throw err;
	}
}

function embedCssInHtml(css, html) {
	return html.replace('</head>', `<style>${css}</style></head>`);
}