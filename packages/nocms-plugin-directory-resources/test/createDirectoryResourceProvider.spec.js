import {activate} from '../src';
import assert from 'assert';
import {createFakePluginActivationContext} from './helpers';
import objectValues from 'object.values';

if (!Object.values) {
	objectValues.shim();
}

describe('plugin', () => {
	let inDir = 'in';
	let outDir = 'out';
	let pluginActivationContext;
	let fileSystem;
	let resourceProviders;

	beforeEach(() => {

		fileSystem = {
			'in/': null,
			'in/_globals.json': '{"title": ""}',
			'in/_index.pug': '',
			'in/_data.json': '{"title": "home"}',
			'in/_index.scss': '',
			'in/_hidden': null,
			'in/_hidden/_index.pug': '',
			'in/_hidden/_data.json': '{"title": "hidden"}',
			'in/_hidden/_index.scss': '',
			'in/hub/': null,
			'in/hub/bar/': null,
			'in/hub/bar/_index.pug': '',
			'in/hub/bar/_data.json': '{"title": "bar"}',
			'in/hub/bar/_index.scss': ''
		};
		resourceProviders = [];
		pluginActivationContext = createFakePluginActivationContext(inDir, outDir, fileSystem, resourceProviders);
		
		activate(pluginActivationContext);
	});

	it ('should register a resource provider', () => {
		let expected = 1;
		let actual = resourceProviders.length;
		
		assert.equal(actual, expected, 'expected 1 resource provider');
	});

	describe ('directoryResourceProvider', () => {
		let directoryResourceProvider;

		beforeEach(() => {
			directoryResourceProvider = resourceProviders[0];
		});

		describe ('getResources', () => {
			it ('should return 2 resource', async () => {
				try {
					let expected = 2;
					let actual = (await directoryResourceProvider.getResources()).length;
				
					assert.equal(actual, expected);
				} catch (err) {
					throw err;
				}
			});
		});
	});
});