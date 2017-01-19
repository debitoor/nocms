import fsExtra from 'fs-extra';
import path from 'path';

export default async function writeFileAsync (file, data, options) {
	return new Promise((resolve) => {
		let directory = path.parse(file).dir;

		fsExtra.ensureDir(directory, err => {
			if (err) {
				throw err;
			}

			fsExtra.outputFile(file, data, options, err => {
				if (err) {
					throw err;
				}

				resolve();
			});
		});
	});
}