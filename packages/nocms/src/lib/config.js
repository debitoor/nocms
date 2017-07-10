import cosmiconfig from 'cosmiconfig';

export default async function config() {
	try {
		let opts = { 'rcExtensions': true };

		let explorer = cosmiconfig('nocms', opts);

		return explorer.load('./')
			.then((configFile) => {
				if (configFile === null) {
					return new Error('Config file not found. Please add a config file to the project, and try again');
				} else {
					return configFile;
				}
			})
			.catch((err) => {
				console.error(err);
			});

	} catch (error) {
		console.error(error);
	}
}