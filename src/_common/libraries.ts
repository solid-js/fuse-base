/**
 * Project libraries.
 *
 * This files is used to include libs that are window scoped.
 * Note that no three shaking can be done here.
 * Some mapping can be done if needed between libs and Typescript definitions.
 */
module.exports = () =>
{
	// ------------------------------------------------------------------------- GSAP

	// Create GSAP scope
	const gsap = {};

	// Enable GreenSockGlobals on window so plugins will know where to go
	window['GreenSockGlobals'] = gsap;

	// Enable gsap on window so Typescript definitions will find it
	window['gsap'] = gsap;

	// GSAP core
	gsap['TweenLite'] = require('gsap/umd/TweenLite');
	gsap['TimelineLite'] = require('gsap/umd/TimelineLite');


	// Easings
	gsap['EasePack'] = require('gsap/umd/EasePack');

	// Plugins
	gsap['AttrPlugin'] = require('gsap/umd/AttrPlugin');
	//gsap['BezierPlugin'] = require('gsap/umd/BezierPlugin');
	gsap['ColorPropsPlugin'] = require('gsap/umd/ColorPropsPlugin');
	gsap['CSSPlugin'] = require('gsap/umd/CSSPlugin');
	//gsap['CSSRulePlugin'] = require('gsap/umd/CSSRulePlugin');
	gsap['DirectionalRotationPlugin'] = require('gsap/umd/DirectionalRotationPlugin');
	//gsap['Draggable'] = require('gsap/umd/Draggable');
	//gsap['EaselPlugin'] = require('gsap/umd/EaselPlugin');
	//gsap['EndArrayPlugin'] = require('gsap/umd/EndArrayPlugin');
	//gsap['jquery'] = require('gsap/umd/jquery.gsap');
	gsap['ModifiersPlugin'] = require('gsap/umd/ModifiersPlugin');
	//gsap['PixiPlugin'] = require('gsap/umd/PixiPlugin');
	//gsap['RaphaelPlugin'] = require('gsap/umd/RaphaelPlugin');
	gsap['RoundPropsPlugin'] = require('gsap/umd/RoundPropsPlugin');
	gsap['ScrollToPlugin'] = require('gsap/umd/ScrollToPlugin');
	//gsap['TextPlugin'] = require('gsap/umd/TextPlugin');

	// TODO : A update une fois que les @types/GSAP 2.0.0 sont prêts
	// TODO : Car là, le tree shaking ne fonctionne pas
	// TODO : Une fois que tout ça ok, on pourra virer les ligne du dessus

	// window['gsap'] = require('gsap');


	// ------------------------------------------------------------------------- ZEPTO

	// Include zepto lib
	require('zepto/src/zepto.js');
	require('zepto/src/event.js');
	require('zepto/src/form.js');
	require('zepto/src/ie.js');
	//require('zepto/src/selector.js');
	require('zepto/src/ajax.js');
};