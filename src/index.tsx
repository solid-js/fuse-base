
// ----------------------------------------------------------------------------- INCLUDED LIBRARIES

// GSAP core
require('gsap/TweenLite');
require('gsap/TimelineLite.js');

// Easings
require('gsap/EasePack.js');

// Plugins
//require('gsap/AttrPlugin.js');
require('gsap/BezierPlugin.js');
require('gsap/ColorPropsPlugin.js');
//require('gsap/CSSPlugin.js');
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


// ----------------------------------------------------------------------------- GLOBAL SCOPE MAPPING

// Map green sock globals into gsap so this is compatible with GSAP typings
window['gsap'] = window['GreenSockGlobals'];


// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file. Needs to be before Main.tsx
require('./Main.less');

// ----------------------------------------------------------------------------- BOOTSTRAP JS

// Load main file
const { Main } = require('./Main');

// Startup application
new Main();