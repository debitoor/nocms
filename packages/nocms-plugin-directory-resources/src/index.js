import createDirectoryResourceProvider from './createDirectoryResourceProvider';

export function activate ({findFiles, fileExists, readFile, registerResourceProvider, resolveInputPath, watchFiles, writeFile}) {
	let directoryResourceProvider = createDirectoryResourceProvider({findFiles, fileExists, readFile, resolveInputPath, watchFiles, writeFile});

	registerResourceProvider(directoryResourceProvider);
}