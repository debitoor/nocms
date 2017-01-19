import createImageResourceProvider from './createImageResourceProvider';

export function activate ({createResourceProvider, registerResourceProvider, findFiles, readFile, watchFiles, writeFile}) {
	const imageResourceProvider = createImageResourceProvider({findFiles, readFile, watchFiles, writeFile});

	registerResourceProvider(imageResourceProvider);
}
