import { findFilesAsync } from './io.js';
import path from 'path';
import { createDebug } from './debug';

const debug = createDebug('plugins');

export async function loadPlugins(pluginActivationContext) {
	return Promise.all([
		findFilesAsync('node_modules/nocms-plugin-*/', {})
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => path.basename(pluginsDirectory))),
		findFilesAsync('/node_modules/nocms-plugin-*/', { cwd: __dirname })
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => {
					debug('pluginPattern path %s', path.join(process.cwd(), pluginsDirectory));
					return path.join(pluginsDirectory);
				}))
	])
		.then(modules => [].concat.apply([], modules))
		.then(modules => modules.map(moduleName => {
			debug('requiring "%s"', path.join(process.cwd(), 'node_modules', moduleName));
			return require(path.join(process.cwd(), 'node_modules', moduleName));
		}
		))
		.then(plugins => plugins.map(plugin => {
			plugin.activate(pluginActivationContext);
		}));
}
