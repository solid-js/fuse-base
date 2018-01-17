import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import {GlobalConfig} from "./data/GlobalConfig";


// ----------------------------------------------------------------------------- BUNDLE INFO

// App bundle info for bundles loader.
module.exports = {
	// App bundle name
	name: 'common',

	// No startup point for common app bundle
	main: false
};


// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file
require('./Main.less');


// ----------------------------------------------------------------------------- INIT COUNT AND HMR TRIGGERS

// Register init of this app bundle and get init count to avoid HMR
const initCount = SolidBundles.registerAppBundleInit( module.exports.name );


// ----------------------------------------------------------------------------- INCLUDED LIBRARIES

// Do not require libraries if this is an HMR trigger
if ( initCount == 0 )
{
	/**
	 * GSAP public scope corresponding to @types/gsap
	 */
	window['gsap'] = {

		// GSAP core
		TweenLite: require('gsap/TweenLite'),
		TimelineLite: require('gsap/TimelineLite.js'),

		// Easings
		EasePack: require('gsap/EasePack.js'),

		// Plugins
		AttrPlugin: require('gsap/AttrPlugin.js'),
		BezierPlugin: require('gsap/BezierPlugin.js'),
		ColorPropsPlugin: require('gsap/ColorPropsPlugin.js'),
		CSSPlugin: require('gsap/CSSPlugin.js'),
		//CSSRulePlugin: require('gsap/CSSRulePlugin.js'),
		DirectionalRotationPlugin: require('gsap/DirectionalRotationPlugin.js'),
		//Draggable: require('gsap/Draggable.js'),
		//EaselPlugin: require('gsap/EaselPlugin.js'),
		//EndArrayPlugin: require('gsap/EndArrayPlugin.js'),
		//jquery: require('gsap/jquery.gsap.js'),
		ModifiersPlugin: require('gsap/ModifiersPlugin.js'),
		//PixiPlugin: require('gsap/PixiPlugin.js'),
		//RaphaelPlugin: require('gsap/RaphaelPlugin.js'),
		RoundPropsPlugin: require('gsap/RoundPropsPlugin.js'),
		ScrollToPlugin: require('gsap/ScrollToPlugin.js'),
		//TextPlugin: require('gsap/TextPlugin.js'),
	};

	/**
	 * ZEPTO
	 */

	require('zepto/src/zepto.js');
	require('zepto/src/event.js');
	require('zepto/src/form.js');
	require('zepto/src/ie.js');
	require('zepto/src/selector.js');
	require('zepto/src/ajax.js');
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

// Inject atoms into config every time
GlobalConfig.instance.inject({
	atoms: require('./atoms').Atoms
});