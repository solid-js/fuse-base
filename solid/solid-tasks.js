const Sparky = require('fuse-box/sparky');

/**
 * Show solid help
 */
const _showSolidHelp = () =>
{
	require('./task-help').help();
};

/**
 * Public API
 */
module.exports = {

	/**
	 * Init solid tasks
	 */
	init : () =>
	{
		// Patch default help sparky task to show solid help
		require('fuse-box/sparky/Sparky').Sparky.showHelp = _showSolidHelp;

		// Default task, show solid help in CLI
		Sparky.task('default', _showSolidHelp);
	},

	/**
	 * Get options from CLI arguments with default values.
	 * Only keys in default options will be used.
	 * Set a value of a key to null to handle this option, without having a default value.
	 * @param pDefaultOptions Default values, overridden by argv
	 * @param pOptionsOverride Values to override on top of argv values.
	 */
	getOptions: (pDefaultOptions, pOptionsOverride) =>
	{
		// Get arguments from yargs
		const argv = require('yargs').argv;

		// Create an option object derived from default options
		let options = {};
		Object.keys( pDefaultOptions ).map( optionKey =>
		{
			options[ optionKey ] = pDefaultOptions[ optionKey ];
		});

		// Override options from argv
		Object.keys( argv ).map( argKey =>
		{
			if (argKey in options)
			{
				options[ argKey ] = argv[argKey];
			}
		});

		// Override options if we have properties to override
		( pOptionsOverride != null )
		&&
		Object.keys( pOptionsOverride ).map( overrideKey =>
		{
			options[ overrideKey ] = pOptionsOverride[ overrideKey ];
		});

		// Return built options
		return options;
	}
};