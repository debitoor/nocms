import path from 'path';
import mime from 'mime';

export default function createFileResourceProvider (findFiles, readFile, watchFiles, writeFile, directory, pattern) {
	pattern = path.posix.join(directory, pattern);
	let fileResourceCache;

	watchFiles('**/!(_)*.json')
		.on('all', handleAll);

	return {
		getResources: getFileResources,
		compileResource: compileFileResource
	};

	function handleAll(event, file) {
		if (fileResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createFileResource(readFile, file)
						.then(fileResource => fileResourceCache[fileResource.id] = fileResource);
					break;
				case 'unlink':
					let fileResourceId = createFileResourceId(file);
					delete fileResourceCache[fileResourceId];
					break;
			}
		}
	}

	async function getFileResources () {
		try {
			if (!fileResourceCache) {
				let files = await findFiles(pattern);
				let fileResources = await createFileResources(files);

				fileResourceCache = fileResources.reduce((fileResourceCache, fileResource) => {
					fileResourceCache[fileResource.id] = fileResource;
					return fileResourceCache;
				}, {});
			}

			return Object.values(fileResourceCache);
		}
		catch (err) {
			throw err;
		}
	}

	async function createFileResources (files) {
		let createFileResourcePromises = files.map(file => createFileResource(file));
		
		return Promise.all(createFileResourcePromises);
	}

	async function createFileResource (file) {
		try {
			let newPath = path.relative(directory, file);
			let id = createFileResourceId(newPath);
			let outFile = newPath;
			let inFile = file;
			let data = {};
			let mimeType = mime.lookup(id);

			return {id, inFile, outFile, mimeType, data};
		} catch (err) {
			throw err;
		}
	}

	async function compileFileResource (fileResource) {
		try {
			let fileBuffer = await readFile(fileResource.inFile);
			return writeFile(fileResource.outFile, fileBuffer);
		} catch (err) {
			throw err;
		}
	}

	function createFileResourceId (file) {
		return ['', ...file.split(path.sep)].join('/');
	}
}