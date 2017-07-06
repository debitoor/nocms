import fs from 'fs';
import nodeSass from 'node-sass';
import path from 'path';

export default async function renderDirectoryResourceCss(directoryResource) {
	try {
		let scssPaths = [
			path.join(directoryResource.physicalPath, '_index.scss'),
			path.join(directoryResource.physicalPath, 'index.scss')
		];

		let scssPath = scssPaths.find(path => fs.existsSync(path));

		if (!scssPath) {
			throw new Error('directory has no _index.scss or index.scss file');
		}

		let css = await renderScssAsync(scssPath);

		return css;
	} catch (err) {
		throw err;
	}
}

async function renderScssAsync (file) {
	return new Promise(resolve => {
		nodeSass.render({file}, (err, result) => {
			if (err) {
				throw err;
			}
		
			let css = result.css.toString();

			resolve(css);
		});
	});
}
