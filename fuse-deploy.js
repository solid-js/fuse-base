const { Files } = require('./helpers/files');
const switches = require('./fuse-switches');
const path = require('path');
const { QuickTemplate } = require('./helpers/quick-template');
const Inquirer = require('inquirer');

/**
 * Get config properties files
 */
const getConfigs = () =>
{
	// Browse properties.js files
	return Files.getFiles('deployer/*.properties.js').all(

		configFile => {
			return {
				// Return name (without properties.js extension)
				name: path.basename( configFile ).split('.properties.js')[0],

				// Method to read config and get properties
				read: () => require(`./${configFile}`)
			};
		}
	);
}

/**
 * Get selected env name.
 * @returns null if no env is selected.
 */
const getSelectedEnv = () =>
{
	// Get selected env file
	const currentEnv = Files.getFiles('deployer/env');

	return (
		// No env selected
		( currentEnv.files.length === 0 )
		? null
		// Read selected env name
		: currentEnv.read()
	);
};

/**
 * Show fatal error
 */
const showError = ( pReason, reject ) =>
{
	console.log('');

	// No env selected
	if (pReason === 'noSelectedEnv')
	{
		console.log(`No env selected.`.red.bold);
		console.log(`> Please create your properties file into ${'deployer/'.bold} and feed properties from ${'default.properties.js'.bold} file.`.red);
		console.log(`> Then select your env with ${'node fuse selectEnv'.bold}`.red)
	}

	// Cant read a file to be deployed
	else if (pReason === 'cantReadFile')
	{
		console.log(`Bad deploy.config.js`.red.bold);
		console.log(`> File src not found.`.red);
		console.log(`> Please check deploy.config.js`.red);
	}

	// Env does not exists
	else if (pReason === 'envDoesNotExists')
	{
		console.log(`Bad env`.red.bold);
		console.log(`> This env is not found.`.red);
		console.log(`> Please check that its corresponding ${'.properties.js'.bold} file exists inside ${'deployer/'.bold} directory`.red);
	}

	// Sound
	console.log("\007");

	// Reject
	reject({});

	// Exit with error
	process.exit(1);
}

/**
 * Select an env from its name.
 * Will not check if env exists.
 * @param pEnvName Name of env to select
 */
const selectEnv = (pEnvName) =>
{
	Files.new('deployer/env').write( pEnvName );
	console.log('');
	console.log(`Env ${pEnvName} is now selected.`.green);
	console.log('');
}


// ----------------------------------------------------------------------------- PUBLIC API

module.exports = {

	/**
	 * Deploy from selected env
	 */
	deploy : () => new Promise(

		( resolve, reject ) =>
		{
			// Get selected env
			const currentEnv = getSelectedEnv();

			// No selected env
			if (currentEnv == null)
			{
				showError( 'noSelectedEnv', reject );
			}

			// Get configs
			const configFiles = getConfigs();

			// Target selected config
			const filteredConfigs = configFiles.filter( config => (config.name === currentEnv) );

			// If config can't be loaded from selected env
			if (filteredConfigs.length === 0)
			{
				showError( reject );
			}

			// Selected config from env
			const currentEnvProperties = filteredConfigs[0].read();

			// Get version from package.json
			currentEnvProperties.version = require('./package').version;

			// Load deployer config and browse files
			require('./deployer/deployer.config').map( fileConfig =>
			{
				// Target source file
				const source = Files.getFiles( fileConfig.src );

				// Check if source file is not found
				if (source.files.length === 0)
				{
					showError('cantReadFile', reject);
				}

				// Write deployed file
				Files.new( fileConfig.dest ).write(

					// Template with current env properties
					QuickTemplate( source.read(), currentEnvProperties )
				)
			});

			// Resolve promise
			resolve();
		}
	),

	/**
	 * Select an env
	 */
	selectEnv : () => new Promise(
		( resolve, reject ) =>
		{
			// Get configs
			const configs = getConfigs().map( env => env.name );

			// Check if we have a env name as argument
			if ( 3 in process.argv )
			{
				console.log(`Tips : You can omit env name to select through a list : "node fuse selectEnv"`.grey);

				// Get selected env name from arguments
				const selectedEnvName = process.argv[3];

				// Check if this env exists
				if ( configs.indexOf( selectedEnvName ) === -1 )
				{
					showError( 'envDoesNotExists', reject );
				}

				// Select env
				selectEnv( selectedEnvName );
				resolve();
			}
			else
			{
				console.log(`Tips : You can directly pass env name as argument : "node fuse selectEnv my-env"`.grey);

				// Check if there is any config
				if (configs.length === 0)
				{
					showError( 'noConfigAvailable', reject );
				}

				// List available scaffolders to user
				Inquirer.prompt({
					type: 'list',
					name: 'envName',
					message: 'Select your env.',
					choices: configs,
					pageSize: 10
				}).then( answer =>
				{
					// Select env
					selectEnv( answer.envName );
					resolve();
				});
			}
		}
	)
};
