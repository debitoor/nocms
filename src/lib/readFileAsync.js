import fs from 'fs';

export default async function readFileAsync (file, options) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, options, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data);
		});
	});
}
