export default function createCachingDecoratedResourceProvider (resourceProvider) {
	let resourceCache;

	return {getResources, compileResource, watchResources};
	
	function watchResources (onChange) {
		resourceProvider.watchResources(onChange);
	}

	async function getResources () {
		try {
			if (!resourceCache) {
				resourceCache = await resourceProvider.getResources();
			}
			
			return Promise.resolve(resourceCache);
		} catch (err) {
			throw err;
		}
	}

	async function compileResource (resource, resourceCompilationContext) {
		return resourceProvider.compileResource(resource, resourceCompilationContext);
	}
}