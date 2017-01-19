import deepFreeze from 'deep-freeze';

export default function createResourceMap (resources) {
	let resourceMap = resources.reduce((resourceMap, resource) => {
		resourceMap[resource.id] = resource;

		return resourceMap;
	}, {});


	return deepFreeze(resourceMap);
}
