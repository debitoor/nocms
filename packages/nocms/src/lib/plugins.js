import { findFilesAsync } from './io.js';
import path from 'path';

export async function loadPlugins(pluginActivationContext) {
	return Promise.all([
		findFilesAsync('node_modules/nocms-plugin-*/', {})
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => path.basename(pluginsDirectory))),
		findFilesAsync(`${process.cwd()}/node_modules/nocms-plugin-*/`, { cwd: __dirname })
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => path.join(process.cwd(), pluginsDirectory)))
	])
		.then(modules => [].concat.apply([], modules))
		.then(modules => modules.map(moduleName => require(moduleName)))
		.then(plugins => plugins.map(plugin => {
			plugin.activate(pluginActivationContext);
		}));
}
