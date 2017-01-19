import createJsonResourceProvider from './createJsonResourceProvider';

export function activate ({createResourceProvider, registerResourceProvider, findFiles, readFile, watchFiles, writeFile}) {
	const jsonResourceProvider = createJsonResourceProvider({findFiles, readFile, watchFiles, writeFile});

	registerResourceProvider(jsonResourceProvider);
}