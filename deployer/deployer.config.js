const { Files } = require('@zouloux/files');
const switches = require('../fuse-switches');

module.exports = [

	// Deploy typescript config
	{
		// Template path
		src		: 'skeletons/deployer/configTypescript',

		// Deployed file path
		dest 	: `${ switches.srcPath }${ switches.commonBundleName }/${ switches.deployedConfigPath }`
	},

	// TODO : Another example
];