import createDirectoryResourceProvider from './createDirectoryResourceProvider';

export function activate ({registerResourceProvider, findFiles, readFile, watchFiles, writeFile, resolveInputPath}) {
	let directoryResourceProvider = createDirectoryResourceProvider({findFiles, readFile, watchFiles, writeFile, resolveInputPath});

	registerResourceProvider(directoryResourceProvider);
}