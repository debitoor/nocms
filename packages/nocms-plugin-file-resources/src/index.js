import createFileResourceProvider from './createFileResourceProvider';

export function activate ({registerResourceProvider, findFiles, readFile, watchFiles, writeFile, config}) {
	console.log(registerResourceProvider);

	console.log('Config: ', config);

	const fileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, './', '**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const sharedFileResourceProvider = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, '../../', 'shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)');
	const sharedFaviconFileResourceProviderc = createFileResourceProvider(findFiles, readFile, watchFiles, writeFile, '../../shared/favicon', '*');

	registerResourceProvider(fileResourceProvider);
	registerResourceProvider(sharedFileResourceProvider);
	registerResourceProvider(sharedFaviconFileResourceProviderc);
}