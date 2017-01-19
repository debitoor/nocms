import createResourceProvider from './createResourceProvider';

export default function createLoggingDecoratedResourceProvider (resourceProvider) {
	let loggingDecoratedResourceProvider = createResourceProvider(getResources, compileResource);
	
	return loggingDecoratedResourceProvider;

	async function getResources () {
		console.log('getResources');
		
		return resourceProvider.getResources();
	}

	async function compileResource (resource, resourceCompilationContext) {
		try {
			let compileStarted = process.hrtime();
			let result = await resourceProvider.compileResource(resource, resourceCompilationContext);
			let compileFinished = process.hrtime(compileStarted);

			console.info('Compiled %s in %ds %dms', resource.id,  compileFinished[0], compileFinished[1]/1000000);

			return result;
		} catch (err) {
			throw err;
		}
	}
}