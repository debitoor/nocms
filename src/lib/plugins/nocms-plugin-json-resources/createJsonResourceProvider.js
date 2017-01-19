import path from 'path';

export default function createJsonResourceProvider ({findFiles, readFile, watchFiles, writeFile}) {
	let jsonResourceCache;

	watchFiles('**/!(_)*.json')
		.on('all', handleAll);

	function handleAll(event, jsonFile) {
		if (jsonResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createJsonResource(readFile, jsonFile)
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
		getResources: getJsonResources.bind(null, jsonResourceCache, findFiles, readFile),
		compileResource: compileJsonResource.bind(null, readFile, writeFile)
	};
}

async function getJsonResources (jsonResourceCache, findFiles, readFile) {
	try {
		if (!jsonResourceCache) {
			let jsonFiles = await getJsonFiles(findFiles);
			let jsonResources = await createJsonResources(readFile, jsonFiles);
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

async function createJsonResources (readFile, jsonFiles) {
	let createJsonResourcePromises = jsonFiles.map(jsonFile => createJsonResource(readFile, jsonFile));
	
	return Promise.all(createJsonResourcePromises);
}

async function createJsonResource (readFile, jsonFile) {
	try {
		let id = '/' + jsonFile.split(path.sep).join('/');
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

async function compileJsonResource (readFile, writeFile, jsonResource) {
	try {
		let json = await readFile(jsonResource.inFile);
		let data = JSON.stringify(JSON.parse(json));
		
		return writeFile(jsonResource.outFile, data, 'utf8');
	} catch (err) {
		throw err;
	}
}

async function getJsonFiles (findFiles) {
	return findFiles('**/!(_)*.json');
}

function createJsonResourceId (path) {
	 return '/' + path.split(path.sep).join('/');
}