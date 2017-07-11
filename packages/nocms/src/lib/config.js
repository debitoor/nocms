import cosmiconfig from 'cosmiconfig';

export default async function config() {
	try {
		let opts = { 'rcExtensions': true };

		let explorer = cosmiconfig('nocms', opts);

		return explorer.load('./')
			.then((configFile) => {
				if (configFile === null) {
					console.error('Config file not found. Using default configurations.');
					return defaultConfig();
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

function defaultConfig() {
	return {
		config: {
			plugins: {
				'file-resources': {
					providers: [
						{ path: './', 'glob': '**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)' },
						{ path: '../../', 'glob': 'shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)' },
						{ path: '../../shared/favicon', 'glob': '*' }
					]
				}
			}
		}
	};
}