import assert from 'assert';
import { createJsonResourceId } from '../lib/createJsonResourceProvider.js';
import { activate } from '../lib/index.js';

const expectedResources = [{
	id: '/fake/path/1',
	inFile: 'fake/path/1',
	outFile: 'fake/path/1',
	mimeType: 'application/json',
	type: 'json',
	data: {
		_id: '5d775b424974756c3bc704a3',
		index: 0,
		guid: '211e66ee-ec86-489d-b1de-ede8435a0058',
		isActive: false,
		balance: '$2,581.53',
		picture: 'http://placehold.it/32x32',
		age: 40,
		eyeColor: 'brown',
		name: 'Gertrude Hogan',
		gender: 'female',
		company: 'DANCERITY',
		email: 'gertrudehogan@dancerity.com',
		phone: '+1 (905) 548-2162'
	}
},
{
	id: '/fake/path/2',
	inFile: 'fake/path/2',
	outFile: 'fake/path/2',
	mimeType: 'application/json',
	type: 'json',
	data: { hello: 'world' }
}];

const fakeFiles = {
	'fake/path/1': JSON.stringify(expectedResources[0].data),
	'fake/path/2': JSON.stringify(expectedResources[1].data)
};

function readFileFake(fakePath) {
	return new Promise( resolve => {
		resolve(fakeFiles[fakePath]);
	});
}

function findFilesFake(globPattern) {
	return new Promise(resolve => {
		resolve(Array.from(Object.keys(fakeFiles)));
	});
}

describe('nocms-plugin-json-resources', () => {
	var files = [];
	var resourceProviders;
	var pluginActivationContext;

	beforeEach(() => {
		files = {};
		resourceProviders = [];
		pluginActivationContext = {
			registerResourceProvider: resourceProvider => resourceProviders.push(resourceProvider),
			writeFile: (file, data, options) => { files[file] = data; return Promise.resolve(); },
			readFile: readFileFake,
			findFiles: findFilesFake
		};
	});

	describe('createJsonResourceId', () => {
		let actualJsonResourceId, expectedJsonResourceId;
		before(() => {
			actualJsonResourceId = createJsonResourceId('here/is/some/path-to-a-/json-file.json');
			expectedJsonResourceId = '/here/is/some/path-to-a-/json-file.json';
		});

		it('should generate resource IDs', () => {
			assert.equal(expectedJsonResourceId, actualJsonResourceId);
		});
	});

	describe('createJsonResourceProvider', async () => {
		beforeEach(() => {
			activate(pluginActivationContext);
		});

		it('registers a resource provider', () => {
			assert.equal(resourceProviders.length, 1);
		});

		describe('resource provider', () => {
			let resourceProvider;

			beforeEach(() => {
				resourceProvider = resourceProviders[0];
			});

			describe('findFiles, readFiles', async () => {
				it('should return the expected json values', async () => {

					const actualResources = await resourceProvider.getResources('not important');

					assert.deepEqual(expectedResources, actualResources);
				});
			});
		});
	});
});