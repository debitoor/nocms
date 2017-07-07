import createFileResourceProvider from './createFileResourceProvider';
import configFile from './getConfigurationFile';

export function activate ({registerResourceProvider, findFiles, readFile, watchFiles, writeFile}) {
	const configPath = configFile.path;
	const configGlob = configFile.glob;

	const fileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, './', '**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const sharedFileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, configPath, configGlob);
	const sharedFaviconFileResourceProviderc = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, '../../shared/favicon', '*');

	registerResourceProvider(fileResourceProvider);
	registerResourceProvider(sharedFileResourceProvider);
	registerResourceProvider(sharedFaviconFileResourceProviderc);
}