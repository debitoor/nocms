import fs from 'fs';
import { promisify } from 'util';
import { expect } from 'chai';
import { activate } from '../src/index.js';

const readFileAsync = promisify(fs.readFile);

let resourceProviders = [];

let fakeFiles = [];
let writtenFiles = [];

let filePaths = [
	'test/test-files/fakeJSFileName.js',
	'test/test-files/fakeHTMLFileName.html',
	'test/test-files/fakeExtFileName.fakeExtension'
];

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

describe('nocms-plugin-file-resources', async () => {
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

	describe('index.js', () => {
		beforeEach(() => {
			let exampleRC = {
				plugins: {
					'file-resources': {
						providers: [
							{ path: './test/test-files', glob: '**/!(_)*.?(fakeExtension|html|mp4|webm)' },
							{ path: './test/test-files', glob: '**/!(_)*.?(js)' }
						]
					}
				}
			};

			resourceProviders = [];
			pluginActivationContext = {
				registerResourceProvider: resourceProvider => resourceProviders.push(resourceProvider),
				writeFile: writeFileFake,
				readFile: readFileFake,
				findFiles: findFilesFake,
				config: exampleRC
			};
			activate(pluginActivationContext);
		});

		it('should export a function', () => {
			expect(typeof activate).to.equal('function');
		});

		describe('createFileResourceProvider', () => {
			it('registers resource providers', () => {
				expect(resourceProviders.length).to.equal(2);
			});

			it('should get resources', async () => {
				console.log('resourceProviders[0]', resourceProviders[0]);
				const expectedResources = [{
					id: '/fakeJSFileName.js',
					inFile: 'test/test-files/fakeJSFileName.js',
					outFile: 'fakeJSFileName.js',
					mimeType: 'application/javascript',
					type: 'file',
					data: {}
				},
				{
					id: '/fakeExtFileName.fakeExtension',
					inFile: 'test/test-files/fakeExtFileName.fakeExtension',
					outFile: 'fakeExtFileName.fakeExtension',
					mimeType: 'application/octet-stream',
					type: 'file',
					data: {}
				},
				{
					id: '/fakeHTMLFileName.html',
					inFile: 'test/test-files/fakeHTMLFileName.html',
					outFile: 'fakeHTMLFileName.html',
					mimeType: 'text/html',
					type: 'file',
					data: {}
				}];
				const actualResources = await resourceProviders[0].getResources();
				expect(actualResources).to.have.deep.members(expectedResources);
			});

			it('should compile resources', async () => {
				const expectedContent = `const twice = (i) => i*3;

				console.log(twice(2));`;

				const resources = await resourceProviders[0].getResources();
				const HTMLFile = resources.find(item => {
					if (item.id === '/fakeJSFileName.js') {
						return item;
					}
				});
				await resourceProviders[0].compileResource(HTMLFile);
				expect(Object.entries(writtenFiles).length).to.equal(1);
				expect(writtenFiles['fakeJSFileName.js'].toString()).to.equal(expectedContent);
			});
		});
	});
});
