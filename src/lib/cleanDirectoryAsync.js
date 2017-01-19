import fsExtra from 'fs-extra';

export default async function cleanDirectoryAsync (directory) {
	return new Promise(resolve => {
		fsExtra.emptyDir(directory, err => {
			if (err) {
				throw err;
			}

			resolve();
		});
	});
}