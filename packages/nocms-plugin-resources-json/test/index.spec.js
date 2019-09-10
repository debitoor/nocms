const assert = require('assert');
const plugin = require('../');

describe('nocms-plugin-resources-json', () => {
	var files;
	var resourceProviders;
	var pluginActivationContext;

	beforeEach (() => {
		files = {};
		resourceProviders = [];
		pluginActivationContext = {
			registerResourceProvider: resourceProvider => resourceProviders.push(resourceProvider),
			writeFile: (file, data, options) => { files[file] = data; return Promise.resolve(); }
		};
	});

	describe('activate', () => {
		beforeEach(() => {
			plugin.activate(pluginActivationContext);
		});

		it('registers a resource provider', () => {
			assert.equal(resourceProviders.length, 1);
		});

		describe('resource provider', () => {
			var resourceProvider;

			beforeEach(() => {
				resourceProvider = resourceProviders[0];
			});

			describe('getResources', () => {
				var resources;

				beforeEach(done => {
					resourceProvider.getResources()
						.then(resourceProviderResources => resources = resourceProviderResources)
						.then(() => done(null))
						.catch(err => done(err));
				});

				it('return an array with one item', () => {
					assert(resources.length, 1);
				});

				describe('resource', () => {
					var resource;

					beforeEach(() => {
						resource = resources[0];
					});

					it('has id /resources.json', () => {
						assert(resource.id, '/resources.json');
					});

					it('has mime application/json', () => {
						assert(resource.mime, 'application/json');
					});
				});
			});

			describe('compileResource', () => {
				var resources;
				var resource;
				var resourceCompilationContext;

				beforeEach(done => {
					resources = resourceProvider.getResources();
					resource = resources[0];
					resourceCompilationContext = {
						resourceMap: {
							'/baz.html': {
								title: 'Baz',
								mime: 'text/html'
							},
							'/qux.html': {
								title: 'Qux',
								mime: 'text/html'
							},
							'/quux.jpg': {
								mime: 'image/jpg'
							}
						}
					};

					resourceProvider.compileResource(resource, resourceCompilationContext).then(done);
				});

				describe('resources.json', () => {
					var file;

					beforeEach(() => {
						file = files['resources.json'];
					});

					it('has expected content', () => {
						assert.equal(file, JSON.stringify({
							'/baz.html': {
								title: 'Baz',
								mime: 'text/html'
							},
							'/qux.html': {
								title: 'Qux',
								mime: 'text/html'
							}
						}, null, 4));
					});
				});
			});
		});
	});
});
