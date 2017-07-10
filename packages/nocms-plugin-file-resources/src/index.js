import createFileResourceProvider from './createFileResourceProvider';

export function activate({ registerResourceProvider, findFiles, readFile, watchFiles, writeFile, configFile }) {

	let fileConfig = configFile.config.plugins['file-resources'].providers[0];
	let sharedConfig = configFile.config.plugins['file-resources'].providers[1];
	let faviconConfig = configFile.config.plugins['file-resources'].providers[2];

	const fileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, fileConfig.path, fileConfig.glob);
	const sharedFileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, sharedConfig.path, sharedConfig.glob);
	const sharedFaviconFileResourceProviderc = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, faviconConfig.path, faviconConfig.glob);

	registerResourceProvider(fileResourceProvider);
	registerResourceProvider(sharedFileResourceProvider);
	registerResourceProvider(sharedFaviconFileResourceProviderc);
}