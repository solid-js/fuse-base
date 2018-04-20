// Load Sparky tasks
const Sparky = require('fuse-box/sparky');

// Some colors in the terminal @see : https://github.com/marak/colors.js/
require('colors');

// Get Files helper for easy Files/Folder manipulating
const { Files } = require('@zouloux/files');

// Load solid constants and fuse config
const solidConstants = require('./solid-constants.config');
const fuseConfig = require('./solid-fuse.config');

// Init solid tasks
require('./solid/solid-tasks').init();


// ----------------------------------------------------------------------------- SETUP

/**
 * Start a new project setup
 */
Sparky.task('setup', () => require('./solid/task-setup').setup());


// ----------------------------------------------------------------------------- SELECT ENV

/**
 * Select env to deploy before each build.
 */
Sparky.task('selectEnv', () => require('./solid/task-deploy').selectEnv());


// ----------------------------------------------------------------------------- FUSE TASKS

/**
 * Start Fuse bundling with dev mode.
 */
Sparky.task('dev', () => require('./solid/task-fuse').dev());

/**
 * Start Fuse bundling with production mode.
 */
Sparky.task('production', ['sprites'], () => require('./solid/task-fuse').production());


// ----------------------------------------------------------------------------- CLEAN

/**
 * Remove all FuseBox caches and clean output directories.
 */
Sparky.task('clean', () => require('./solid/task-clean').clean());

/**
 * Clean generated sprites
 */
Sparky.task('cleanSprites', () => require('./solid/task-clean').cleanSprites());

/**
 * Tries to patches common problems.
 */
Sparky.task('noProblemo', () => require('./solid/task-clean').noProblemo());


// ----------------------------------------------------------------------------- SCAFFOLDER

/**
 * Run the solid scaffolder interactively
 */
Sparky.task('scaffold', () => require('./solid/task-scaffold').run());


// ----------------------------------------------------------------------------- CHECKERS

/**
 * Check errors on all Typescript files
 */
Sparky.task('typeCheck', () => require('./solid/task-check').typescript());

/**
 * Check errors on all Less files
 */
Sparky.task('lessCheck', () => require('./solid/task-check').less());


// ----------------------------------------------------------------------------- SPRITES AND IMAGE MIN

/**
 * Generate all sprites from all bundles.
 */
Sparky.task('sprites', () => require('./solid/task-sprites').run());

/**
 * Minify all jpg and png images inside src folder.
 * The original file will not be altered, a .min version will be created next to it.
 * Target the .min file from Less or Typescript files after this task.
 * Lonely .min files will be removed.
 */
Sparky.task('imagemin', () => require('./solid/task-imagemin').run());


// ----------------------------------------------------------------------------- CUSTOM TASKS

/**
 * Create your tasks here for this project.
 * You can interact easily with Files and have solidConstants here.
 * Files : @see https://github.com/zouloux/files
 */
Sparky.task('taskName', () =>
{
	// ...
});



// ----------------------------------------------------------------------------- TODO ZONE

/**
 * TODO : Refacto Avril
 *
 * - Revoir les arrow dans les logs avec les couleurs cyan un peu partout
 * - Continuer task-setup
 * - Voir pourquoi le symlink de solidify lib fait planter la compile
 *
 */

/**
 * TODO Doc :
 * - IMPORTANT Documenter bundles.ts & pages.ts
 * - deployer
 * - scaffold
 * - dev / production
 *
 * TODO Refacto du framework avec nouvelle API :
 * - MouseWheel FF
 * - Scaffold AppView
 * - new ScrollDispatcher implementation ou autre lib
 *
 * A TESTER :
 * - IMG base 64 ?
 *
 * BETTER :
 * - Test inferno / preact à la place de react ?
 * - tsconfig JSON5 ?
 */
