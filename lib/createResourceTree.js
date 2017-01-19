'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createResourceTree;

var _deepFreeze = require('deep-freeze');

var _deepFreeze2 = _interopRequireDefault(_deepFreeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createResourceTree(resourceMap) {
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

	return (0, _deepFreeze2.default)(resourceTree);
}