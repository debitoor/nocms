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
				id: '/resources.json',
				mime: 'application/json'
			}
		];
	}

	function compileResource (resource, resourceCompilationContext) {
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
}