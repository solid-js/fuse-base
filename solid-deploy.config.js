// Load solid constants
const solidConstants = require('./solid-constants.config');

/**
 * Each files will be created from current env properties.
 * Env properties are loaded from properties/*.properties.js file depending on current select env.
 *
 * To create a set of env properties, create a %your-env%.properties.js file into properties folder
 * then select an env, type "node solid selectEnv"
 *
 * First tabs of templates are automatically removed if you keep indenting with tabs.
 *
 * package.json version is added automatically as a property named "version".
 *
 * All files are deployed before each Fuse build (dev or production)
 */

module.exports = [

	/**
	 * Deploy typescript config, those properties are all added to GlobalConfig object
	 *
	 * If you add properties, also add their typings into GlobalConfig.
	 *
	 * "base" and "version" are already added from process.env, so no need to add them here.
	 * We keep them as example.
	 */
	{
		enabled: true,

		// Template of the file to generate
		template: (properties) => `
			module.exports = {
				//base: '${properties.base}',
				//version: '${properties.version}',
			};
		`,

		// Where the generated file is saved
		dest 	: `${ solidConstants.srcPath }${ solidConstants.commonBundleName }/${ solidConstants.deployedConfigPath }`
	},

	// Create a dotenv file from properties
	// @see https://github.com/motdotla/dotenv
	{
		enabled: false,

		// Template of the file to generate
		template: (properties) => `
			${
				Object.keys( properties ).map(
					propertyName => `${propertyName}=${properties[propertyName]}`
				).join("\n")
			}
		`,

		// Where the generated file is saved
		dest 	: `.env`
	}

	/**
	 * You can also create htaccess file here or generate config.php files for example.
	 */
];