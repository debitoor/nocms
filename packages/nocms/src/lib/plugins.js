import { findFilesAsync } from './io.js';
import path from 'path';

export async function loadPlugins(pluginActivationContext) {
	return Promise.all([
		findFilesAsync(`${process.cwd()}/node_modules/nocms-plugin-*/`, {})
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => path.basename(pluginsDirectory))),
		findFilesAsync('plugins/nocms-plugin-*/', { cwd: __dirname })
			.then(pluginDirectories => pluginDirectories
				.map(pluginsDirectory => './' + pluginsDirectory))
	])
		.then(modules => [].concat.apply([], modules))
		.then(modules => modules.map(moduleName => require(path.join(process.cwd(), 'node_modules', moduleName))))
		.then(plugins => plugins.map(plugin => {
			plugin.activate(pluginActivationContext);
		}));
}
