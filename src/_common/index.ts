
// ----------------------------------------------------------------------------- INCLUDED LIBRARIES

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
if (!('Zepto' in window)) require('zepto/dist/zepto.js');


// ----------------------------------------------------------------------------- GLOBAL SCOPE MAPPING

// Map green sock globals into gsap so this is compatible with GSAP typings
window['gsap'] = window['GreenSockGlobals'];


// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file. Needs to be before Main.tsx
//require('./Main.less');


// ----------------------------------------------------------------------------- GLOBAL CONFIG

// Import global config helper
import {GlobalConfig} from "./data/GlobalConfig";

// Load config data
const embeddedConfig = require('./data/config.js');

// We inject in order to have priority of window config over embedded config.
// Version is in last so it can't be overridden.

// 1. Inject embedded config data into global config
GlobalConfig.instance.inject( embeddedConfig );

// 2. Inject global config from window scope
if ( '__globalConfig' in window )
{
	GlobalConfig.instance.inject( window['__globalConfig'] );
}

// 3. Inject version from package.json
GlobalConfig.instance.inject({
	version: process.env['VERSION']
});