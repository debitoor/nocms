const assert = require('assert');
const plugin = require('../');

describe('nocms-plugin-sitemap', () => {
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
						.then(sitemapResources => resources = sitemapResources)
						.then(() => done())
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

					it('has id /sitemap.xml', () => {
						assert(resource.id, '/sitemap.xml');
					});

					it('has mime text/xml', () => {
						assert(resource.mime, 'text/xml');
					});
				});
			});

			describe('compileResource', () => {
				var resources;
				var resource;
				var resourceCompilationContext;

				beforeEach(done => {
					resourceProvider.getResources()
						.then(sitemapResources => resources = sitemapResources)
						.then(() => done())
						.catch(err => done(err));
				});

				beforeEach(done => {
					resource = resources[0];
					resourceCompilationContext = {
						resourceMap: {
							'/baz.html': {
								url: 'https://foo.bar/baz.html',
								mime: 'text/html'
							},
							'/qux.html': {
								url: 'https://foo.bar/qux.html',
								mime: 'text/html'
							},
							'/quux.jpg': {
								url: 'https://foo.bar/quux.jpg',
								mime: 'image/jpg'
							}
						}
					};
					
					resourceProvider.compileResource(resource, resourceCompilationContext).then(done);
				});

				describe('sitemap.xml', () => {
					var file;

					beforeEach(() => {
						file = files['/sitemap.xml'];
					});

					it('has expected content', () => {
						assert.equal(file, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://foo.bar/baz.html</loc></url><url><loc>https://foo.bar/qux.html</loc></url></urlset>');
					});
				});
			});
		});
	});
});