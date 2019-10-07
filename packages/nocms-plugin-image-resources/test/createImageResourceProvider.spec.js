import { expect } from 'chai';
import fs from 'fs';
import { promisify } from 'util';
import { activate } from '../lib/index.js';

const readFileAsync = promisify(fs.readFile);
const fakeFiles = [];

const filePaths = [
	'test/test-images/50mm-249.jpg',
	'test/test-images/8-tallet.jpg'
];

const writtenFiles = [];

async function fileToBuffer(path) {
	return readFileAsync(path);
}

function readFileFake(fakePath) {
	return new Promise((resolve, reject) => {
		const fakeFile = fakeFiles.find(fakeFile => fakeFile.path === fakePath);

		if (!fakeFile) {
			reject('readFileFakeError');
		}

		resolve(fakeFile.data);
	});
}

function writeFileFake(filePath, data, options) {
	writtenFiles[filePath] = data;
	return Promise.resolve();
}

function findFilesFake(globPattern) {
	return new Promise(resolve => {
		resolve(fakeFiles.map(fakeFile => fakeFile.path));
	});
}

describe('nocms-plugin-image-resources', () => {
	let resourceProviders = [];
	let pluginActivationContext;

	before(async () => {
		await Promise.all(filePaths.map(async (filePath) => {
			fakeFiles.push({
				path: filePath,
				data: await fileToBuffer(filePath)
			});
			return;
		}));
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
			expect(resourceProviders.length).to.equal(1);
		});

		describe('getResources', async () => {
			let resources;
			before(async () => {
				resources = await resourceProvider.getResources();
			});

			it('should return found images', () => {
				expect(resources.length).to.equal(2);
			});
		});
	});
});
