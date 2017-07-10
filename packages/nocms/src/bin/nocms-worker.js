#!/usr/bin/env node
import { createCommandHandler, createCommandDispatcher, createCommandReceiver } from '../lib/threading';
import { createDebug } from '../lib/debug';
import { loadPlugins } from '../lib/plugins';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createLoggingDecoratedResourceProvider from '../lib/createLoggingDecoratedResourceProvider';
import createPluginActivationContext from '../lib/createPluginActivationContext';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import createResourceMap from '../lib/createResourceMap';
import createResourceTree from '../lib/createResourceTree';
import nocmsAscii from '../lib/nocmsAscii';
import objectValues from 'object.values';
import config from '../lib/config';

if (!Object.values) {
	objectValues.shim();
}

async function main() {
	try {
		const debug = createDebug('worker');

		const optionDefinitions = [
			{ name: 'help', alias: 'h' },
			{ name: 'in-dir', alias: 'i', type: String, description: 'Input directory to read resources from.' },
			{ name: 'out-dir', alias: 'o', type: String, description: 'Output directory to write compiled resource to.' }
		];

		const usageDefinition = [
			{ header: 'NOCMS Worker Process Command Line Interface', content: nocmsAscii, raw: true },
			{ header: 'Synopsis', content: '$ nocms-worker <options>' },
			{ header: 'Options', optionList: optionDefinitions }
		];

		let options;

		try {
			options = commandLineArgs(optionDefinitions);
		} catch (err) {
			options = { help: true };
		}

		if (options.help) {
			const usage = commandLineUsage(usageDefinition);
			console.log(usage);
			return;
		}

		const inDir = options['in-dir'];
		const outDir = options['out-dir'];

		// Load config rc file
		const configFile = await config();

		// Create an array to hold all the resource providers.
		const resourceProviders = [];

		// Create a function that plugins can use to register resource providers.
		const registerResourceProvider = createRegisterResourceProvider(resourceProviders);

		// Create an activation context that plugins will get when activated.
		const pluginActivationContext = createPluginActivationContext(inDir, outDir, registerResourceProvider, configFile);

		// Load all the plugins with the activation content.
		await loadPlugins(pluginActivationContext);

		// Create our logging decorated composite resource provider that uses all the resource providers registered by the plugins.
		const resourceProvider = createLoggingDecoratedResourceProvider(
			createCompositeResourceProvider(resourceProviders)
		);

		let resourceCompilationContext;

		// Create command handlers that will handle commands dispatched by the command dispatcher.
		const commandHandlers = [
			createCommandHandler(['compileResource'], async (command) => {
				debug('compileResource(%o)', command);

				const { resourceId, cache } = command.params;

				if (!resourceCompilationContext || !cache) {
					const resources = await resourceProvider.getResources();
					const resourceMap = createResourceMap(resources);
					const resourceTree = createResourceTree(resourceMap);

					resourceCompilationContext = { resourceMap, resourceTree };
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