/**
 * Project libraries.
 *
 * This files is used to include libs that are window scoped.
 * Note that no three shaking can be done here.
 * Some mapping can be done if needed between libs and Typescript definitions.
 */
module.exports = () =>
{
	// ------------------------------------------------------------------------- NERV DEV TOOLS

	// Load nerv devtools for react dev tools, in dev mode only
	if (process.env.NODE_ENV !== 'production')
	{
		require('nerv-devtools');
	}


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
	//gsap['BezierPlugin'] = require('gsap/BezierPlugin');
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

};