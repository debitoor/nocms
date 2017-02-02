#!/usr/bin/env node
import {cleanDirectoryAsync} from '../lib/io';
import {cpus} from 'os';
import {createCommandSender, createCommandWorkerProcessPool} from '../lib/threading';
import {createServer} from '../lib/server';
import {loadPlugins} from '../lib/plugins';
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';
import commandLineUsage from 'command-line-usage';
import createCompositeResourceProvider from '../lib/createCompositeResourceProvider';
import createPluginActivationContext from '../lib/createPluginActivationContext';
import createRegisterResourceProvider from '../lib/createRegisterResourceProvider';
import nocmsAscii from '../lib/nocmsAscii';
import objectValues from 'object.values';
import path from 'path';

if (!Object.values) {
	objectValues.shim();
}

async function main () {
	try {
		const defaultOptionsDefinitions = [
			{name: 'help', alias: 'h'}
		];

		const commands = ['compile', 'server'];

		const commandOptionDefinitions = {
			compile: [
				{name: 'concurrency', alias: 'c', type: Number, defaultValue: cpus().length, description: 'Concurrency.'},
				{name: 'help', alias: 'h'},
				{name: 'in-dir', alias: 'i', type: String, description: 'Input directory to read resources from.', required: true},
				{name: 'out-dir', alias: 'o', type: String, description: 'Output directory to write compiled resource to.', required: true},
			],
			server: [
				{name: 'concurrency', alias: 'c', type: Number, defaultValue: cpus().length, description: 'Concurrency.'},
				{name: 'help', alias: 'h'},
				{name: 'in-dir', alias: 'i', type: String, description: 'input directory.', required: true},
				{name: 'out-dir', alias: 'o', type: String, description: 'output directory.', required: true},
				{name: 'port', alias: 'p', type: Number, description: 'port to listen to.', required: true}
			]
		};

		const defaultUsageDefinition = [
			{header: 'NOCMS Command Line Interface', content: nocmsAscii, raw: true},
			{header: 'Synopsis', content: '$ nocms <command> <options>'},
			{header: 'Commands', content: [
				{name: 'compile', summary: 'Compile a site.'},
				{name: 'server', summary: 'Start a web server.'},
			]},
			{header: 'Options', optionList: defaultOptionsDefinitions}
		];

		const commandUsageDefinitions = {
			compile: [
				{header: 'NOCMS Command Line Interface', content: nocmsAscii, raw: true},
				{header: 'Synopsis', content: '$ nocms compile <options>'},
				{header: 'Options', optionList: commandOptionDefinitions['compile']}
			],
			server: [
				{header: 'NOCMS Command Line Interface', content: nocmsAscii, raw: true},
				{header: 'Synopsis', content: '$ nocms server <options>'},
				{header: 'Options', optionList: commandOptionDefinitions['server']}
			]
		};

		let command, options;

		try {
			const result = commandLineCommands(commands);
			command = result.command;
			const optionDefinitions = commandOptionDefinitions[command];
			options = commandLineArgs(optionDefinitions, {argv: result.argv});
			
			const valid = optionDefinitions
				.filter(optionDefinition => optionDefinition.required)
				.every(optionDefinition => Object.keys(options).indexOf(optionDefinition.name) >= -1);

			if (!valid) {
				options.help = true;
			}
		} catch (err) {
			command = command || '';
			options = {help: true};
		}

		if (options.help) {
			const usage = commandLineUsage(commandUsageDefinitions[command] || defaultUsageDefinition);
			console.log(usage);
			return;
		}

		const inDir = options['in-dir'];
		const outDir = options['out-dir'];
		const port = options['port'];
		const concurrency = options['concurrency'];

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
		const commandWorkerProcessPool = createCommandWorkerProcessPool(concurrency, path.resolve(__dirname, './nocms-worker.js'), ['worker', '--in-dir', inDir, '--out-dir', outDir]);

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
				createServer({commandSender, resolveOutputPath: pluginActivationContext.resolveOutputPath, resourceProvider, port});
				break;
		}
	} catch (err) {
		console.error(err, err.stack);

		process.exit(1);
	}
}

main();
