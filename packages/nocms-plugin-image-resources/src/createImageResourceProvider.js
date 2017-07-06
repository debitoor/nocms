import path from 'path';
import gm from 'gm';
import mime from 'mime';

let imageResourceCache;

export default function createImageResourceProvider ({findFiles, readFile, watchFiles, writeFile}) {
	watchFiles('**/!(_)*.?(jpg|jpeg|png|gif)')
		.on('all', handleAll);

	function handleAll(event, imageFile) {
		if (imageResourceCache) {
			switch (event) {
				case 'add':
				case 'change':
					createImageResource(readFile, imageFile)
						.then(imageResource => imageResourceCache[imageResource.id] = imageResource);
					break;
				case 'unlink':
					let imageResourceId = createImageResourceId(imageFile);
					delete imageResourceCache[imageResourceId];
					break;
			}
		}
	}

	return {
		getResources: getImageResources.bind(null, findFiles, readFile),
		compileResource: compileImageResource.bind(null, readFile, writeFile)
	};
}

async function getImageResources (findFiles, readFile) {
	try {
		if (!imageResourceCache) {
			let imageFiles = await getImageFiles(findFiles);
			let imageResources = await createImageResources(readFile, imageFiles);
			imageResourceCache = imageResources.reduce((imageResourceCache, imageResource) => {
				imageResourceCache[imageResource.id] = imageResource;
				return imageResourceCache;
			}, {});
		}

		return Object.values(imageResourceCache);
	}
	catch (err) {
		throw err;
	}
}

async function createImageResources (readFile, imageFiles) {
	let createImageResourcePromises = imageFiles.map(imageFile => createImageResource(readFile, imageFile));
	
	return Promise.all(createImageResourcePromises);
}

async function createImageResource (readFile, imageFile) {
	try {
		let id = createImageResourceId(imageFile);
		let inFile = imageFile;
		let outFile = imageFile;
		let data = await getImageData(readFile, imageFile);
		let mimeType = mime.lookup(id);

		return {id, inFile, outFile, data, mimeType};
	} catch (err) {
		throw err;
	}
}

async function getImageData(readFile, imageFile) {
	try {
		let imageBuffer = await readFile(imageFile);
		let imageSize = await getImageSize(imageBuffer);

		return {size: imageSize};
	} catch (err) {
		throw err;
	}
}

async function getImageSize(imageBuffer) {
	return new Promise(resolve => {
		gm(imageBuffer)
			.size((err, size) => {
				if (err) {
					resolve();
				}

				resolve(size);
		});
	});
}

async function compileImageResource (readFile, writeFile, imageResource) {
	try {
		let imageBuffer = await readFile(imageResource.inFile);
		
		return writeFile(imageResource.outFile, imageBuffer);
	} catch (err) {
		throw err;
	}
}

async function getImageFiles (findFiles) {
	return findFiles('**/!(_)*.?(jpg|jpeg|png|gif)');
}

function createImageResourceId (imageFile) {
	return '/' + imageFile.split(path.sep).join('/');
}