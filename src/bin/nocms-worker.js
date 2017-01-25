#!/usr/bin/env node
import {createCommandHandler, createCommandDispatcher, createCommandReceiver} from '../lib/threading';
import commandLineArgs from 'command-line-args';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createLoggingDecoratedResourceProvider from '../lib/createLoggingDecoratedResourceProvider';
import createPluginActivationContext from '../lib/createPluginActivationContext';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import createResourceMap from '../lib/createResourceMap';
import createResourceTree from '../lib/createResourceTree';
import loadPlugins from '../lib/loadPlugins';
import objectValues from 'object.values';

if (!Object.values) {
	objectValues.shim();
}

async function main () {
	try {
		const optionDefinitions = [
			{ name: 'in-dir', type: String },
			{ name: 'out-dir', type: String }
		];

		const options = commandLineArgs(optionDefinitions);

		const inDir = options['in-dir'];
		const outDir = options['out-dir'];

		// Create an array to hold all the resource providers
		const resourceProviders = [];

		// Create a function that plugins can use to register resource providers
		const registerResourceProvider = createRegisterResourceProvider(resourceProviders);

		// Create the activation contenxt that plugins will get when activated
		const pluginActivationContext = createPluginActivationContext(inDir, outDir, registerResourceProvider);

		// Load all the addons with the activation content
		await loadPlugins(pluginActivationContext);
	
		// Create our logging decorated composite resource provider that uses all the resource providers registered by the addons
		const resourceProvider = createLoggingDecoratedResourceProvider(
			createCompositeResourceProvider(resourceProviders)
		);

		let resourceCompilationContext;

		// Create command handlers.
		const commandHandlers = [
			createCommandHandler(['compileResource'], async (command) => {
				const {resourceId, cache} = command.params;

				if (!resourceCompilationContext || !cache) {
					const resources = await resourceProvider.getResources();
					const resourceMap = createResourceMap(resources);
					const resourceTree = createResourceTree(resourceMap);
					
					resourceCompilationContext = {resourceMap, resourceTree};
				}

				const resource = resourceCompilationContext.resourceMap[resourceId];

				if (!resource) {
					throw new Error(`Resource ${resourceId} Not Found`);
				}

				return resourceProvider.compileResource(resource, resourceCompilationContext);
			})
		];

		// Create command dispatcher that dispatches commands to command handlers.
		const commandDispatcher = createCommandDispatcher(commandHandlers);

		// Create a command receiver that receives commands and dispatches them using the command disaptcher.
		const commandReceiver = createCommandReceiver(commandDispatcher);

		// Signal that the command receiver is now idle and ready to receive commands.
		commandReceiver.idle();
	} catch (err) {
		console.error(err);
	}
}

main();