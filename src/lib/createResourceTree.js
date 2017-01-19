import deepFreeze from 'deep-freeze';

export default function createResourceTree (resourceMap) {
	let resourceIds = Object.keys(resourceMap);
	resourceIds.sort();

	let resourceTree = resourceIds.reduce((resourceTree, resourceId) => {
		let resource = resourceMap[resourceId];

		let resourcePath = resourceId.split('/').filter(Boolean);
		let node = resourceTree;

		for (let i = 0; i < resourcePath.length; i++) {
			let fragment = resourcePath[i];
			node[fragment] = node[fragment] || {};
			node = node[fragment];
		}

		node._data = resource.data;

		return resourceTree;
	}, {});

	return deepFreeze(resourceTree);
}