import path from 'path';

export default function createJsonResourceProvider ({findFiles, readFile, watchFiles, writeFile}) {
	let pattern = '**/!(_)*.json';
	let jsonResourceCache;

	watchFiles(pattern)
		.on('all', handleAll);

	function handleAll(event, jsonFile) {
		if (jsonResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createJsonResource(jsonFile)
						.then(jsonResource => jsonResourceCache[jsonResource.id] = jsonResource);
					break;
				case 'unlink':
					let jsonResourceId = createJsonResourceId(jsonFile);
					delete jsonResourceCache[jsonResourceId];
					break;
			}
		}
	}

	return {
		getResources: getJsonResources,
		compileResource: compileJsonResource
	};

	async function getJsonResources () {
		try {
			if (!jsonResourceCache) {
				let jsonFiles = await findFiles(pattern);
				let jsonResources = await createJsonResources(jsonFiles);
				jsonResourceCache = jsonResources.reduce((jsonResourceCache, jsonResource) => {
					jsonResourceCache[jsonResource.id] = jsonResource;
					return jsonResourceCache;
				}, {});
			}

			return Object.values(jsonResourceCache);
		}
		catch (err) {
			throw err;
		}
	}

	async function createJsonResources (jsonFiles) {
		let createJsonResourcePromises = jsonFiles.map(createJsonResource);
		
		return Promise.all(createJsonResourcePromises);
	}

	async function createJsonResource (jsonFile) {
		try {
			let id = createJsonResourceId(jsonFile);
			let inFile = jsonFile;
			let outFile = jsonFile;
			let json = await readFile(jsonFile);
			let data = JSON.parse(json);
			let mimeType = 'application/json';

			return {id, inFile, outFile, mimeType, data};
		} catch (err) {
			throw err;
		}
	}

	async function compileJsonResource (jsonResource) {
		try {
			let json = await readFile(jsonResource.inFile);
			let data = JSON.stringify(JSON.parse(json));
			
			return writeFile(jsonResource.outFile, data, 'utf8');
		} catch (err) {
			throw err;
		}
	}

	function createJsonResourceId (jsonFile) {
		return '/' + jsonFile.split(path.sep).join('/');
	}
}