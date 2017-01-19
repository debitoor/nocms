import findFilesAsync from './findFilesAsync.js';
import path from 'path';

export default async function loadPlugins (pluginActivationContext) {
	let pluginsPattern = path.join(__dirname, 'plugins/nocms-plugin-*/' );

	return findFilesAsync(pluginsPattern)
		.then(pluginDirectories => {
			return pluginDirectories.map(pluginsDirectory => require(pluginsDirectory));
		})
		.then(plugins =>{
			plugins.forEach(plugin => plugin.activate(pluginActivationContext));
		});
}
