import path from 'path';
import gm from 'gm';
import mime from 'mime';

const imageResourceType = 'image';
const imageResourceGlobPattern = '**/!(_)*.?(jpg|jpeg|png|gif)';

export default function createImageResourceProvider ({findFiles, readFile, watchFiles, writeFile}) {
	let imageResourceCache;

	return {
		getResources: getImageResources,
		compileResource: compileImageResource,
		canCompileResource: canCompileImageResource,
		watchResources: watchImageResources
	};

	function watchImageResources (onChange) {
		watchFiles(imageResourceGlobPattern).on('all', (event, imageFile) => {
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

			onChange();
		});
	}

	async function getImageResources () {
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
			let type = imageResourceType;
			let mimeType = mime.lookup(id);

			return {id, inFile, outFile, data, mimeType, type};
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

	async function compileImageResource (imageResource) {
		try {
			let imageBuffer = await readFile(imageResource.inFile);
			
			return writeFile(imageResource.outFile, imageBuffer);
		} catch (err) {
			throw err;
		}
	}

	function canCompileImageResource (imageResource) {
		return imageResource.type === imageResourceType;
	}

	async function getImageFiles (findFiles) {
		return findFiles(imageResourceGlobPattern);
	}

	function createImageResourceId (imageFile) {
		return '/' + imageFile.split(path.sep).join('/');
	}
}
