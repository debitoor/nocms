export default function createRegisterResourceProvider (resourceProviders) {
	return function registerResourceProvider (resourceProvider) {
		resourceProviders.push(resourceProvider);
	};
}