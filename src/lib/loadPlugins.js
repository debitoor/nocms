import findFilesAsync from './findFilesAsync.js';
import path from 'path';

export default async function loadPlugins (pluginActivationContext) {
	return Promise.all([
		findFilesAsync('node_modules/nocms-plugin-*/', {}).then(pluginDirectories => pluginDirectories.map(pluginsDirectory => path.basename(pluginsDirectory))),
		findFilesAsync('plugins/nocms-plugin-*/', {cwd: __dirname}).then(pluginDirectories => pluginDirectories.map(pluginsDirectory => './' + pluginsDirectory))
	])
	.then(modules => [].concat.apply([], modules))
	.then(modules => modules.map(moduleNames => require(moduleNames)))
	.then(plugins => plugins.map(plugin => plugin.activate(pluginActivationContext)));
}
