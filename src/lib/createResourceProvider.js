export default function createResourceProvider (getResources, compileResource) {
	if (typeof getResources !== 'function') {
		throw new TypeError('getResources is not a function');
	}

	if (typeof compileResource !== 'function') {
		throw new TypeError('compileResource is not a function');
	}

	return {getResources, compileResource};
}