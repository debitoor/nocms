import glob from 'glob';

export default async function findFilesAsync (pattern, options) {
	return new Promise((resolve, reject) => {
		glob(pattern, options, (err, files) => {
			if (err) {
				return reject(err);
			}

			resolve(files);
		});
	});
}