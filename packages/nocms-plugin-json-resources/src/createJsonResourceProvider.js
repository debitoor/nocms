import path from 'path';

const jsonResourceGlobPattern = '**/!(_)*.json';
const jsonResourceType = 'json';

export default function createJsonResourceProvider ({findFiles, readFile, watchFiles, writeFile}) {
	let jsonResourceCache;

	return {
		getResources: getJsonResources,
		compileResource: compileJsonResource,
		canCompileResource: canCompileJsonResource,
		watchResources: watchJsonResources,
	};

	function watchJsonResources (onChange) {
		watchFiles(jsonResourceGlobPattern).on('all', (event, jsonFile) => {
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

			onChange();
		});
	}

	async function getJsonResources () {
		try {
			if (!jsonResourceCache) {
				let jsonFiles = await findFiles(jsonResourceGlobPattern);
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
			let type = jsonResourceType;

			return {id, inFile, outFile, mimeType, type, data};
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

	function canCompileJsonResource (jsonResource) {
		return jsonResource.type === jsonResourceType;
	}

	function createJsonResourceId (jsonFile) {
		return '/' + jsonFile.split(path.sep).join('/');
	}
}