#!/usr/bin/env node
import { createCommandSender, createCommandHandler, createCommandDispatcher, createCommandReceiver, createCommandWorkerProcessPool} from '../lib/threading';
import cleanDirectoryAsync from '../lib/cleanDirectoryAsync';
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createDirectoryBoundFileExists from '../lib/createDirectoryBoundFileExists';
import createDirectoryBoundFindFilesAsync  from '../lib/createDirectoryBoundFindFilesAsync';
import createDirectoryBoundReadFileAsync from '../lib/createDirectoryBoundReadFileAsync';
import createDirectoryBoundResolvePath from '../lib/createDirectoryBoundResolvePath';
import createDirectoryBoundWatchFiles from '../lib/createDirectoryBoundWatchFiles';
import createDirectoryBoundWriteFileAsync from '../lib/createDirectoryBoundWriteFileAsync';
import createLoggingDecoratedResourceProvider from '../lib/createLoggingDecoratedResourceProvider';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import createResourceMap from '../lib/createResourceMap';
import createResourceTree from '../lib/createResourceTree';
import createWebServer from '../lib/createWebServer';
import fileExists from '../lib/fileExists';
import findFilesAsync from '../lib/findFilesAsync';
import loadPlugins from '../lib/loadPlugins';
import objectValues from 'object.values';
import readFileAsync from '../lib/readFileAsync';
import watchFiles from '../lib/watchFiles';
import writeFileAsync from '../lib/writeFileAsync';

if (!Object.values) {
	objectValues.shim();
}

async function main () {
	try {
		const validCommands = ['compile', 'server', 'worker'];
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
			],
			worker: [
				{ name: 'in-dir', type: String },
				{ name: 'out-dir', type: String }
			]
		};

		const options = commandLineArgs(optionDefinitions[command], argv);

		const inDir = options['in-dir'];
		const outDir = options['out-dir'];
		const port = options['port'];

		// create an array to hold all the resource providers
		const resourceProviders = [];

		// create a function that addons can use to register resource providers
		const registerResourceProvider = createRegisterResourceProvider(resourceProviders);

		// create the activation contenxt that plugins will get when activated
		const pluginActivationContext = {
			registerResourceProvider,
			fileExists: createDirectoryBoundFileExists(fileExists, inDir),
			findFiles: createDirectoryBoundFindFilesAsync(findFilesAsync, inDir),
			readFile: createDirectoryBoundReadFileAsync(readFileAsync, inDir),
			watchFiles: createDirectoryBoundWatchFiles(watchFiles, inDir),
			writeFile: createDirectoryBoundWriteFileAsync(writeFileAsync, outDir),
			resolveInputPath: createDirectoryBoundResolvePath(inDir),
			resolveOutputPath: createDirectoryBoundResolvePath(outDir)
		};

		// load all the addons with the activation content
		await loadPlugins(pluginActivationContext);
	
		// create our logging decorated composite resource provider that uses all the resource providers registered by the addons
		const resourceProvider = createLoggingDecoratedResourceProvider(
			createCompositeResourceProvider(resourceProviders)
		);
		
		let commandSender, resources, resourceCompilationContext;

		switch (command) {
			case 'compile':
				let compileStarted = process.hrtime();

				commandSender = createCommandSender();
				resources = await resourceProvider.getResources();

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
				commandSender = createCommandSender(createCommandWorkerProcessPool(1));

				createWebServer({commandSender, resolveOutputPath: createDirectoryBoundResolvePath(outDir), resourceProvider, port});
				break;

			case 'worker': {
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

				const commandDispatcher = createCommandDispatcher(commandHandlers);
				const commandReceiver = createCommandReceiver(commandDispatcher);
				commandReceiver.idle();
			}
		}
	} catch (err) {
		console.error(err);
	}
}

main();