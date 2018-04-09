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

// Load fuse-box-css if we are not in production.
// This patch CSS code-splitting
if (process.env.NODE_ENV !== 'production')
{
	require('fuse-box-css');
}


// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file
require('./Main.less');


// ----------------------------------------------------------------------------- INIT COUNT AND HMR TRIGGERS

// Register init of this app bundle and get init count to avoid HMR
SolidBundles.registerAppBundleInit( module.exports.name );

// Do not require libraries if this is an HMR trigger
if ( SolidBundles.getAppBundleInitCount( module.exports.name ) == 0 )
{
	// ------------------------------------------------------------------------- GSAP

	// Create GSAP scope
	const gsap = {};

	// Enable GreenSockGlobals on window so plugins will know where to go
	window['GreenSockGlobals'] = gsap;

	// Enable gsap on window so Typescript definitions will find it
	window['gsap'] = gsap;

	// GSAP core
	gsap['TweenLite'] = require('gsap/TweenLite');
	gsap['TimelineLite'] = require('gsap/TimelineLite');


	// Easings
	gsap['EasePack'] = require('gsap/EasePack');

	// Plugins
	gsap['AttrPlugin'] = require('gsap/AttrPlugin');
	gsap['BezierPlugin'] = require('gsap/BezierPlugin');
	gsap['ColorPropsPlugin'] = require('gsap/ColorPropsPlugin');
	gsap['CSSPlugin'] = require('gsap/CSSPlugin');
	//gsap['CSSRulePlugin'] = require('gsap/CSSRulePlugin');
	gsap['DirectionalRotationPlugin'] = require('gsap/DirectionalRotationPlugin');
	//gsap['Draggable'] = require('gsap/Draggable');
	//gsap['EaselPlugin'] = require('gsap/EaselPlugin');
	//gsap['EndArrayPlugin'] = require('gsap/EndArrayPlugin');
	//gsap['jquery'] = require('gsap/jquery.gsap');
	gsap['ModifiersPlugin'] = require('gsap/ModifiersPlugin');
	//gsap['PixiPlugin'] = require('gsap/PixiPlugin');
	//gsap['RaphaelPlugin'] = require('gsap/RaphaelPlugin');
	gsap['RoundPropsPlugin'] = require('gsap/RoundPropsPlugin');
	gsap['ScrollToPlugin'] = require('gsap/ScrollToPlugin');
	//gsap['TextPlugin'] = require('gsap/TextPlugin');


	// ------------------------------------------------------------------------- ZEPTO

	// Include zepto lib
	require('zepto/src/zepto.js');
	require('zepto/src/event.js');
	require('zepto/src/form.js');
	require('zepto/src/ie.js');
	require('zepto/src/selector.js');
	require('zepto/src/ajax.js');


	// ------------------------------------------------------------------------- GLOBAL CONFIG

	// Load config data
	const embeddedConfig = require('./data/config');

	// 1. Inject embedded config data into global config
	GlobalConfig.instance.inject( embeddedConfig );

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