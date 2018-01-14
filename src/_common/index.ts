import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import {GlobalConfig} from "./data/GlobalConfig";

// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file
require('./Main.less');


// ----------------------------------------------------------------------------- BUNDLE INFOS

// App bundle info for bundles loader.
module.exports = {
	// App bundle name
	name: 'common',

	// No startup point for common app bundle
	main: false
};


// ----------------------------------------------------------------------------- INCLUDED LIBRARIES

// Register init of this app bundle and get init count to avoid HMR
const initCount = SolidBundles.registerAppBundleInit( module.exports.name );

// ----------------------------------------------------------------------------- INCLUDED LIBRARIES

// Do not require libraries if this is an HMR trigger
if ( initCount == 0 )
{
	// GSAP core
	require('gsap/TweenLite');
	require('gsap/TimelineLite.js');

	// Easings
	require('gsap/EasePack.js');

	// Plugins
	require('gsap/AttrPlugin.js');
	require('gsap/BezierPlugin.js');
	require('gsap/ColorPropsPlugin.js');
	require('gsap/CSSPlugin.js');
	//require('gsap/CSSRulePlugin.js');
	require('gsap/DirectionalRotationPlugin.js');
	//require('gsap/Draggable.js');
	//require('gsap/EaselPlugin.js');
	//require('gsap/EndArrayPlugin.js');
	//require('gsap/jquery.gsap.js');
	require('gsap/ModifiersPlugin.js');
	//require('gsap/PixiPlugin.js');
	//require('gsap/RaphaelPlugin.js');
	require('gsap/RoundPropsPlugin.js');
	require('gsap/ScrollToPlugin.js');
	//require('gsap/TextPlugin.js');

	// Load zepto in quantum mode, zepto shimming is incompatible with quantum
	if (!('Zepto' in window)) require('zepto/dist/zepto.min.js');
}


// ----------------------------------------------------------------------------- GLOBAL SCOPE MAPPING

// Do not require libraries if this is an HMR trigger
if ( initCount == 0 )
{
	// Map green sock globals into gsap so this is compatible with GSAP typings
	window['gsap'] = window['GreenSockGlobals'];
}


// ----------------------------------------------------------------------------- GLOBAL CONFIG

// Do not prepare GlobalConfig if this is an HMR trigger
if ( initCount == 0 )
{
	// Load config data
	const embeddedConfig = require('./data/config');

	// 1. Inject embedded config data into global config
	GlobalConfig.instance.inject( embeddedConfig );

	// 2. Inject version from package.json
	GlobalConfig.instance.inject({
		version: process.env['VERSION']
	});
}