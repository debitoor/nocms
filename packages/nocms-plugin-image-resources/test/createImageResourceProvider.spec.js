import assert from 'assert';
// import { createImageResourceProvider } from '../lib/createImageResourceProvider.js';
import { activate } from '../lib/index.js';
import fs from 'fs';

const filePaths = [
	'test/test-images/50mm-249.jpg',
	'test/test-images/8-tallet.jpg'
];

let resourceProviders = [];
let pluginActivationContext;
const fakeFiles = [];
const writtenFiles = [];

function fileToBuffer(path){
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if( err ) {
				return reject(err);
			}
			return resolve(data);
		});
	});
}

function readFileFake(fakePath) {
	return new Promise((resolve, reject) => {
		fakeFiles.forEach( fakeFile => {
			if(fakeFile.path === fakePath){
				return resolve(fakeFile.data);
			}
		});
		return reject('wat');
	});
}

function writeFileFake(filePath, data, options){
	writtenFiles[filePath] = data;
	return Promise.resolve();
}

function findFilesFake(globPattern) {
	return new Promise(resolve => {
		resolve(fakeFiles.map(fakeFile => fakeFile.path));
	});
}

describe('nocms-plugin-image-resources', () => {
	before(async () => {
		await Promise.all(filePaths.map(async (filePath) => {
			fakeFiles.push({
				path: filePath,
				data: await fileToBuffer(filePath)
			});
			return;
		}));
		console.log(fakeFiles);
	});

	beforeEach(() => {
		resourceProviders = [];
		pluginActivationContext = {
			registerResourceProvider: resourceProvider => resourceProviders.push(resourceProvider),
			writeFile: writeFileFake,
			readFile: readFileFake,
			findFiles: findFilesFake,
		};
		activate(pluginActivationContext);
	});

	describe('createImageResourceProvider', async () => {
		let resourceProvider;

		beforeEach(() => {
			resourceProvider = resourceProviders[0];
		});

		it('registers a resource provider', () => {
			assert.equal(resourceProviders.length, 1);
		});

		describe('getResources', async () => {
			let resources;
			before(async () => {
				resources = await resourceProvider.getResources();
			});

			it('should return found images', () => {
				assert.equal(resources.length, 2);
			});
		});
	});
});
