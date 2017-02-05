module.exports = {
	activate: activate
};

function activate (pluginActivationContext) {
	const registerResourceProvider = pluginActivationContext.registerResourceProvider;
	const writeFile = pluginActivationContext.writeFile;
	const sitemapResourceProvider = createSitemapResourceProvider(writeFile);

	registerResourceProvider(sitemapResourceProvider);
}

function createSitemapResourceProvider (writeFile) {
	return {
		getResources: getResources,
		compileResource: compileResource
	};

	function getResources () {
		return [
			{
				id: '/sitemap.xml',
				mime: 'text/xml'
			}
		];
	}

	function compileResource (resource, resourceCompilationContext) {
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

		return writeFile('sitemap.xml', sitemap);
	}
}