module.exports = {
	activate: activate
};

const sitemapResourceType = 'sitemap';

function activate (pluginActivationContext) {
	const registerResourceProvider = pluginActivationContext.registerResourceProvider;
	const writeFile = pluginActivationContext.writeFile;
	const sitemapResourceProvider = createSitemapResourceProvider(writeFile);

	registerResourceProvider(sitemapResourceProvider);
}

function createSitemapResourceProvider (writeFile) {
	return {
		getResources: getSitemapResources,
		compileResource: compileSitemapResource,
		canCompileResource: canCompileSitemapResource,
		watchResources: () => {}
	};

	function getSitemapResources () {
		return Promise.resolve([
			{
				id: '/sitemap.xml',
				outFile: '/sitemap.xml',
				mime: 'text/xml',
				type: sitemapResourceType
			}
		]);
	}

	function compileSitemapResource (sitemapResource, resourceCompilationContext) {
		const resourceMap = resourceCompilationContext.resourceMap;
		const resources = Object.keys(resourceMap).reduce((resources, resourceId) => {
			const resource = resourceMap[resourceId];

			if (resource.mime === 'text/html') {
				resources.push(resource);
			}

			return resources;
		}, []);

		const urls = resources.map(resource => '<url><loc>' + resource.url + '</loc></url>').join('');
		const sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>';

		return writeFile(sitemapResource.outFile, sitemap);
	}

	function canCompileSitemapResource (sitemapResource) {
		return sitemapResource.type === sitemapResourceType;
	}
}
