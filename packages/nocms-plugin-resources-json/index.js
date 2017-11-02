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
				id: '/resources.json',
				mime: 'application/json'
			}
		]);
	}

	function compileSitemapResource (resource, resourceCompilationContext) {
		const resourceMap = resourceCompilationContext.resourceMap;
		const resources = Object.keys(resourceMap).reduce((resources, resourceId) => {
			const resource = resourceMap[resourceId];

			if (resource.mime === 'text/html') {
				resources[resourceId] = resource;
			}

			return resources;
		}, {});

		return writeFile('resources.json', JSON.stringify(resources, null, 4));
	}

	function canCompileSitemapResource (sitemapResource) {
		return sitemapResource.type === sitemapResourceType;
	}
}