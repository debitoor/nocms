import renderDirectoryResourceCss from './renderDirectoryResourceCss';
import renderDirectoryResourceHtml from './renderDirectoryResourceHtml';
import renderDirectoryResourceJs from './renderDirectoryResourceJs';
import cssBingo from 'css-bingo';

export default async function renderDirectoryResource(directoryResource, resources) {
	try {
		const css = await renderDirectoryResourceCss(directoryResource);
		const html = await renderDirectoryResourceHtml(directoryResource, resources);
		const js = await renderDirectoryResourceJs(directoryResource);

		const processedCss = cssBingo(css, html);
		const htmlWithPurifiedCssEmbedded = embedCssInHtml(processedCss, html);
		const htmlWithPurifiedCssAndJsEmbedded = embedJsInHtml(js, htmlWithPurifiedCssEmbedded);

		return htmlWithPurifiedCssAndJsEmbedded;
	} catch (err) {
		throw err;
	}
}

function embedCssInHtml(css, html) {
	return html.replace('</head>', `<style>${css}</style></head>`);
}

function embedJsInHtml(js, html) {
	if (js) {
		return html.replace('</body>', `<script>${js}</script></body>`);
	}

	return html;
}