#!/usr/bin/env node
import { createCommandSender, createCommandWorkerProcessPool} from '../lib/threading';
import cleanDirectoryAsync from '../lib/cleanDirectoryAsync';
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createPluginActivationContext from '../lib/createPluginActivationContext';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import createWebServer from '../lib/createWebServer';
import loadPlugins from '../lib/loadPlugins';
import objectValues from 'object.values';
import path from 'path';

if (!Object.values) {
	objectValues.shim();
}

async function main () {
	try {
		const validCommands = ['compile', 'server'];
		const {command, argv} = commandLineCommands(validCommands);

		const optionDefinitions = {
			compile: [
				{ name: 'in-dir', type: String },
				{ name: 'out-dir', type: String }
			],
			server: [
				{ name: 'in-dir', type: String },
				{ name: 'out-dir', type: String },
				{ name: 'port', type: Number }
			]
		};

		const options = commandLineArgs(optionDefinitions[command], argv);

		const inDir = options['in-dir'];
		const outDir = options['out-dir'];
		const port = options['port'];

		// Create an array to hold all the resource providers.
		const resourceProviders = [];

		// Create a function that plugins can use to register resource providers.
		const registerResourceProvider = createRegisterResourceProvider(resourceProviders);

		// Create the activation contenxt that plugins will get when activated.
		const pluginActivationContext = createPluginActivationContext(inDir, outDir, registerResourceProvider);

		// Load all the plugins with the activation content.
		await loadPlugins(pluginActivationContext);
	
		// Create composite resource provider that uses all the resource providers registered by the plugins.
		const resourceProvider = createCompositeResourceProvider(resourceProviders);
		
		// Create the commandworker process pool that will handle compilation of resources.
		const commandWorkerProcessPool = createCommandWorkerProcessPool(1, path.resolve(__dirname, './nocms-worker.js'), ['worker', '--in-dir', inDir, '--out-dir', outDir]);
		
		// Create the command sender that sends commands to the command worker process pool.
		const commandSender = createCommandSender(commandWorkerProcessPool);

		switch (command) {
			case 'compile':
				let compileStarted = process.hrtime();
				let resources = await resourceProvider.getResources();

				await cleanDirectoryAsync(outDir);

				const commandPromises = resources
					.map((resource, idx) => ({
						id: idx,
						name: 'compileResource',
						params: {resourceId: resource.id, cache: true}
					}))
					.map(commandSender.sendCommand);
				
				Promise.all(commandPromises)
					.then(results => {
						let compileFinished = process.hrtime(compileStarted);
						console.info(`Compiled ${resources.length} resources in %ds %dms`, compileFinished[0], compileFinished[1]/1000000);

						process.exit(0);
					})
					.catch(err => {
						console.error('error', err, err.stack);

						process.exit(1);
					});

				break;

			case 'server':
				createWebServer({commandSender, resolveOutputPath: pluginActivationContext.resolveOutputPath, resourceProvider, port});
				break;
		}
	} catch (err) {
		console.error(err);

		throw err;
	}
}

main();