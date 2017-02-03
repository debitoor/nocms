import renderDirectoryResourceCss from './renderDirectoryResourceCss';
import renderDirectoryResourceHtml from './renderDirectoryResourceHtml';
import cssBingo from 'css-bingo';

export default async function renderDirectoryResource(directoryResource, resources) {
	try {
		let css = await renderDirectoryResourceCss(directoryResource);
		let html = await renderDirectoryResourceHtml(directoryResource, resources);
		let processedCss = cssBingo(css, html);
		let htmlWithPurifiedCssEmbedded = embedCssInHtml(processedCss, html);

		return htmlWithPurifiedCssEmbedded;
	} catch (err) {
		throw err;
	}
}

function embedCssInHtml(css, html) {
	return html.replace('</head>', `<style>${css}</style></head>`);
}