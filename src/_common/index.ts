import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import {GlobalConfig} from "./data/GlobalConfig";
import {ResponsiveManager} from "solidify-lib/helpers/ResponsiveManager";


// ----------------------------------------------------------------------------- BUNDLE INFO

// App bundle info for bundles loader.
module.exports = {
	// App bundle name
	name: 'common',

	// No startup point for common app bundle
	main: false
};


// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load fuse-box-css if we are not in production.
// This patch CSS code-splitting
if (process.env.NODE_ENV !== 'production')
{
	require('fuse-box-css');
}

// Load main Less file
require('./Main.less');


// ----------------------------------------------------------------------------- INIT COUNT AND HMR TRIGGERS

// Register init of this app bundle and get init count to avoid HMR
SolidBundles.registerAppBundleInit( module.exports.name );

// Do not require libraries if this is an HMR trigger
if ( SolidBundles.getAppBundleInitCount( module.exports.name ) == 0 )
{
	// Load project libs
	require('./libraries')();

	// 1. Load config data and inject data into global config
	GlobalConfig.instance.inject( require('./data/config') );

	// 2. Inject version from package.json
	GlobalConfig.instance.inject({
		version: process.env['VERSION'],
		base: process.env['BASE']
	});

	// Inject atoms into ResponsiveManager
	ResponsiveManager.instance.autoSetBreakpointsFromLess(
		require('./atoms').Atoms
	);
}