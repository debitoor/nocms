#!/usr/bin/env node
import { createCommandSender, createCommandHandler, createCommandDispatcher, createCommandReceiver, createCommandWorkerProcessPool} from '../lib/threading';
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createLoggingDecoratedResourceProvider from '../lib/createLoggingDecoratedResourceProvider';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import createResourceMap from '../lib/createResourceMap';
import createResourceProvider from '../lib/createResourceProvider';
import createResourceTree from '../lib/createResourceTree';
import createStaticFileResourceProvider from '../lib/createStaticFileResourceProvider';
import createWebServer from '../lib/createWebServer';
import findFilesAsync from '../lib/findFilesAsync';
import loadPlugins from '../lib/loadPlugins';
import objectValues from 'object.values';
import path from 'path';
import readFileAsync from '../lib/readFileAsync';
import writeFileAsync from '../lib/writeFileAsync';
import createWatchFiles from '../lib/createWatchFiles';
import cleanDirectoryAsync from '../lib/cleanDirectoryAsync';

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

		const findFiles = (pattern, options) => findFilesAsync(path.posix.join(inDir, pattern), options).then(files => files.map(file => path.relative(inDir, file)));
		const readFile = (file, options) => readFileAsync(path.resolve(inDir, file), options);
		const watchFiles = createWatchFiles(inDir);
		const writeFile = (file, data, options) => writeFileAsync(path.resolve(outDir, file), data, options);
		const resolveInputPath = (file) => path.resolve(inDir, file);
		const resolveOutputPath = (file) => path.resolve(outDir, file);

		// create an array to hold all the resource providers
		const resourceProviders = [
			createStaticFileResourceProvider(findFiles, readFile, writeFile, './', '**/!(_)*.?(docx|pdf|svg|txt|xlsx)'),
			createStaticFileResourceProvider(findFiles, readFile, writeFile, '../../', 'shared/**/!(_)*.?(docx|gif|jpeg|jpg|pdf|ico|png|svg|txt|xlsx)'),
			createStaticFileResourceProvider(findFiles, readFile, writeFile, '../../shared/favicon', '*')
		];

		// create a function that addons can use to register resource providers
		const registerResourceProvider = createRegisterResourceProvider(resourceProviders);

		// create the activation contenxt that addons will get when activated
		const pluginActivationContext = {
			createResourceProvider,
			registerResourceProvider,
			findFiles,
			readFile,
			watchFiles,
			writeFile,
			resolveInputPath,
			resolveOutputPath
		};

		// load all the addons with the activation content
		await loadPlugins(pluginActivationContext);
	
		// create our logging decorated composite resource provider that uses all the resource providers registered by the addons
		const resourceProvider = createLoggingDecoratedResourceProvider(
			createCompositeResourceProvider(resourceProviders)
		);
		
		let commandSender, resources;

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
						params: {resourceId: resource.id}
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

				createWebServer({commandSender, resolveOutputPath, resourceProvider, port});
				break;

			case 'worker': {
				const commandHandlers = [
					createCommandHandler(['compileResource'], async (command) => {
						const {resourceId} = command.params;
						const resources = await resourceProvider.getResources();
						const resourceMap = createResourceMap(resources);
						const resource = resourceMap[resourceId];

						if (!resource) {
							throw new Error(`Resource ${resourceId} Not Found`);
						}

						const resourceTree = createResourceTree(resourceMap);
						const resourceCompilationContext = {resourceMap, resourceTree};

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