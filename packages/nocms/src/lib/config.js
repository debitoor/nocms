import cosmiconfig from 'cosmiconfig';

export default async function config() {
	try {
		let opts = { 'rcExtensions': true };

		let explorer = cosmiconfig('nocms', opts);

		return explorer.load('./')
			.then((configFile) => {
				return configFile;
			})
			.catch((err) => {
				console.error(err);
			});

	} catch (error) {
		console.error(error);
	}
}