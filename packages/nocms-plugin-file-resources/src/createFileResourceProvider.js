import path from 'path';
import mime from 'mime';

const fileResourceType = 'file';

export default function createFileResourceProvider (findFiles, readFile, watchFiles, writeFile, directory, pattern) {
	pattern = path.posix.join(directory, pattern);
	let fileResourceCache;

	return {
		getResources: getFileResources,
		compileResource: compileFileResource,
		canCompileResource: canCompileFileResource
	};

	function handleAll(event, file) {
		if (fileResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createFileResource(file)
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
		if (!fileResourceCache) {
			watchFiles(pattern).on('all', handleAll);
	
			let files = await findFiles(pattern);
			let fileResources = await createFileResources(files);

			fileResourceCache = fileResources.reduce((fileResourceCache, fileResource) => {
				fileResourceCache[fileResource.id] = fileResource;
				return fileResourceCache;
			}, {});
		}

		return Object.values(fileResourceCache);
	}

	async function createFileResources (files) {
		let createFileResourcePromises = files.map(file => createFileResource(file));
		
		return Promise.all(createFileResourcePromises);
	}

	async function createFileResource (file) {
		let newPath = path.relative(directory, file);
		let id = createFileResourceId(newPath);
		let outFile = newPath;
		let inFile = file;
		let data = {};
		let type = fileResourceType;
		let mimeType = mime.lookup(id);

		return {id, inFile, outFile, mimeType, type, data};
	}

	async function compileFileResource (fileResource) {
		let fileBuffer = await readFile(fileResource.inFile);

		return writeFile(fileResource.outFile, fileBuffer);
	}

	function canCompileFileResource (fileResource) {
		return fileResource.type === fileResourceType;
	}

	function createFileResourceId (file) {
		return ['', ...file.split(path.sep)].join('/');
	}
}