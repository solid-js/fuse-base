const { Files } = require('@zouloux/files');
const path = require('path');

// Load solid constants
const solidConstants = require('../solid-constants.config');

/**
 * Get config properties files
 */
const _getConfigs = () =>
{
	// Browse properties.js files
	return Files.getFiles(`${ solidConstants.propertiesPath }/*.properties.js`).all(

		configFile => {
			return {
				// Return name (without properties.js extension)
				name: path.basename( configFile ).split('.properties.js')[0],

				// Method to read config and get properties
				read: () => require(`../${ configFile }`)
			};
		}
	);
}

/**
 * Get selected env name.
 * @returns null if no env is selected.
 */
const _getSelectedEnv = () =>
{
	// Get selected env file
	const currentEnv = Files.getFiles( solidConstants.envPath );

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
const _showError = ( pReason, reject ) =>
{
	console.log('');

	// No env selected
	if (pReason === 'noSelectedEnv')
	{
		console.log(`No env selected.`.red.bold);
		console.log(`  → Please create your properties file into ${ solidConstants.propertiesPath.bold } and feed properties from ${'default.properties.js'.bold} file.`.red);
		console.log(`  → Then select your env with ${'node solid selectEnv'.bold}`.red)
	}

	// Env does not exists
	else if (pReason === 'envDoesNotExists')
	{
		console.log(`Bad env`.red.bold);
		console.log(`  →  This env is not found.`.red);
		console.log(`  →  Please check that its corresponding ${'.properties.js'.bold} file exists inside ${ solidConstants.propertiesPath.bold } directory`.red);
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
const _selectEnv = (pEnvName) =>
{
	Files.new( solidConstants.envPath ).write( pEnvName );
	console.log(`Env ${ pEnvName } is now selected.`.green);
}

/**
 * Get properties from an env name.
 * Will return null if there was a problem while loading properties.
 */
const _getPropertiesFromEnvName = (currentEnv) =>
{
	// Get configs
	const configFiles = _getConfigs();

	// Target selected config
	const filteredConfigs = configFiles.filter( config => (config.name === currentEnv) );

	// If config can't be loaded from selected env
	if ( filteredConfigs.length === 0 )
	{
		return null;
	}

	// Selected config from env
	return filteredConfigs[0].read();
}

/**
 * Cached version of current env properties.
 */
let cacheCurrentEnvProperties


// ----------------------------------------------------------------------------- PUBLIC API

/**
 * Public API
 */
module.exports = {

	/**
	 * Get properties from current env.
	 * Will return null if there was a problem while loading properties.
	 * No error, no process killing.
	 */
	getPropertiesFromCurrentEnv: () =>
	{
		// Return cache if already loaded
		if (cacheCurrentEnvProperties != null) return cacheCurrentEnvProperties;

		// Get selected env
		const currentEnv = _getSelectedEnv();

		// Return null if there is no selected env
		if (currentEnv == null) return null;

		// Get current properties
		const currentEnvProperties = _getPropertiesFromEnvName( currentEnv );

		// Return null if there is properties
		if (currentEnvProperties == null) return null;

		// Get version from package.json
		currentEnvProperties.version = require('../package').version;

		// Store properties in cache
		cacheCurrentEnvProperties = currentEnvProperties;

		// Return loaded properties
		return currentEnvProperties;
	},

	/**
	 * Deploy from selected env.
	 * Will kill process if there is any error.
	 */
	deploy : () => new Promise( ( resolve, reject ) =>
	{
		// If current env properties are not in cache
		let currentEnvProperties = cacheCurrentEnvProperties;
		if (currentEnvProperties == null)
		{
			// Get selected env
			const currentEnv = _getSelectedEnv();

			// No selected env
			if (currentEnv == null)
			{
				_showError( 'noSelectedEnv', reject );
			}

			// Get current env properties
			currentEnvProperties = _getPropertiesFromEnvName(currentEnv);

			// Unable to get current properties
			if (currentEnvProperties == null)
			{
				_showError( 'envDoesNotExists', reject );
			}
		}

		// Load deployer config and browse files
		require('../solid-deploy.config').map( fileConfig =>
		{
			// Skip disabled
			if ( !fileConfig.enabled ) return;

			// Write deployed file
			Files.new( fileConfig.dest ).write(

				// Exec template and remove tabs
				fileConfig.template( currentEnvProperties )
				.replace(/(\n\t\t\t)/gmi, "\n")

				// Remove first and last lines
				.split("\n")
				.slice(1, -1)
				.join("\n")
			)
		});

		// Resolve promise
		resolve( currentEnvProperties );
	}),

	/**
	 * Select an env
	 */
	selectEnv : () => new Promise( async ( resolve, reject ) =>
	{
		// Only load Inquirer here to speed up
		const Inquirer = require('inquirer');

		// Get configs
		const configs = _getConfigs().map( env => env.name );

		// Check if we have a env name as argument
		if ( 3 in process.argv )
		{
			// Get selected env name from arguments
			const selectedEnvName = process.argv[3];

			// Check if this env exists
			if ( configs.indexOf( selectedEnvName ) === -1 )
			{
				_showError( 'envDoesNotExists', reject );
			}

			// Select env
			_selectEnv( selectedEnvName );
			resolve();
		}
		else
		{
			console.log(`Tips : You can directly pass env name as argument : "node solid selectEnv my-env"`.grey);

			// Check if there is any config
			if (configs.length === 0)
			{
				_showError( 'noConfigAvailable', reject );
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
				_selectEnv( answer.envName );
				resolve();
			});
		}
	})
};
