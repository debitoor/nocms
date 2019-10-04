import createFileResourceProvider from './createFileResourceProvider';

export function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, config }) {
	if (config === null || typeof config === 'undefined') {
		return;
	}

	const providers = config.plugins['file-resources'].providers;

	// create a resource provider for every entry in the config (path->glob)
	for (let i = 0; i < providers.length; i++) {
		const providerConfig = providers[i];
		const fileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, providerConfig.path, providerConfig.glob);
		registerResourceProvider(fileResourceProvider);
	}
}
