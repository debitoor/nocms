import createFileResourceProvider from './createFileResourceProvider';

export function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, config }) {


	if (config === null) {
		return;
	}
	const providers = config.plugins['file-resources'].providers;

	for (let i = 0; i < providers.length; i++) {
		const providerConfig = providers[i];
		const fileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, providerConfig.path, providerConfig.glob);
		registerResourceProvider(fileResourceProvider);
	}
}