
// ----------------------------------------------------------------------------- BOOTSTRAP CSS

// Load main Less file. Needs to be before Main.tsx
require('./Main.less');

// ----------------------------------------------------------------------------- BOOTSTRAP JS

// Load main file
const { Main } = require('./Main');

// Startup application
new Main();