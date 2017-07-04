'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = createResourceMap;

var _deepFreeze = require('deep-freeze');

var _deepFreeze2 = _interopRequireDefault(_deepFreeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createResourceMap(resources) {
	let resourceMap = resources.reduce((resourceMap, resource) => {
		resourceMap[resource.id] = resource;

		return resourceMap;
	}, {});

	return (0, _deepFreeze2.default)(resourceMap);
}