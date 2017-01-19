import createResourceProvider from './createResourceProvider';

export default function createCachingDecoratedResourceProvider (resourceProvider) {
	let resourceCache;
	let cachingDecoratedResourceProvider = createResourceProvider(getResources, compileResource);
	
	return cachingDecoratedResourceProvider;
	
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