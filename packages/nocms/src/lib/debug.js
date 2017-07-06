import debug from 'debug';

export function createDebug (namespace) {
	return debug(`nocms:${namespace}`);
}