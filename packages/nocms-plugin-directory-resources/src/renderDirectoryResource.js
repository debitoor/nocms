import renderDirectoryResourceCss from './renderDirectoryResourceCss';
import renderDirectoryResourceHtml from './renderDirectoryResourceHtml';
import renderDirectoryResourceJs from './renderDirectoryResourceJs';
import cssBingo from 'css-bingo';

export default async function renderDirectoryResource(directoryResource, resources) {
	try {
		const css = await renderDirectoryResourceCss(directoryResource);
		const html = await renderDirectoryResourceHtml(directoryResource, resources);
		const processedCss = cssBingo(css, html);
		let htmlWithAssets = embedCssInHtml(processedCss, html);

		try {
			const js = await renderDirectoryResourceJs(directoryResource);
			if(js !== ''){
				htmlWithAssets = embedJsInHtml(js, htmlWithAssets);
			}
		} catch(e) {
			console.log('JS_ERROR');
			console.log(e);
			// still render if JS part broken
		}

		return htmlWithAssets;
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