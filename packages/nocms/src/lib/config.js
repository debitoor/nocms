import cosmiconfig from 'cosmiconfig';

export default async function loadConfig() {
	try {
		let opts = { 'rcExtensions': true };

		let explorer = cosmiconfig('nocms', opts);

		return explorer.load('./')
			.then((configFile) => {
				if (configFile === null) {
					console.error('Config file not found.');
					return configFile;
				} else {
					return configFile.config;
				}
			})
			.catch((err) => {
				console.error(err);
			});

	} catch (error) {
		console.error(error);
	}
}