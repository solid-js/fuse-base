
// ----------------------------------------------------------------------------- TODO ZONE

/**
 * TODO :
 * - SYNC Typecheck ? Check typescript before reloading ?
 * - BIP when fail !
 * - Tout tester !
 * - Refacto du framework avec nouvelle API
 * - Deployer
 * - Sprite generator
 * - SVG plugin ?
 * - IMG ?
 * - IMG base 64 ?
 * - React en production mode ?
 *
 * - http://fuse-box.org/plugins/banner-plugin ?
 *
 * BETTER :
 * - Test inferno à la place de react
 * - If possible : assets folder, this is cleaner !
 * - tsconfig JSON5
 *
 * DONE : Bundles CSS en option pour éviter le full JS
 * DONE : Task dev + task production
 * DONE : Sparky
 * DONE : Code splitting CSS
 * DONE : Code splitting JS
 */


// ----------------------------------------------------------------------------- IMPORTS

const {
	FuseBox,
	Sparky,
	CLI,
	EnvPlugin,
	WebIndexPlugin,
	TypeScriptHelpers,
	QuantumPlugin,
	LESSPlugin,
	PostCSSPlugin,
	CSSPlugin,
	CSSResourcePlugin
} = require("fuse-box");
const path = require("path");
const { TypeHelper } = require('fuse-box-typechecker');
const { getAsyncBundlesFromFileSystem, generateShims } = require("./helpers/fuse-helpers");


// ----------------------------------------------------------------------------- PATHS AND CONSTANTS

// Source folder
const src = 'src/';

// Output directory
const dist = 'dist/';

// Compiled resources folder (inside dist)
const resources = 'resources/';

// Default apps entry point
const entryPoint = 'Main.tsx';

// Async bundle folders (inside src)
const async = 'async/';

// Vendors bundle name
const vendorsBundleName = 'vendors';

// ----------------------------------------------------------------------------- CONFIG

/**
 * Generate an index.html from template.
 * If false, and quantum is enabled, will generate a quantum.json manifest file.
 */
const generateWebIndex = true;

/**
 * Support old browsers like IE 11 or iOS 8
 */
const legacySupport = true;

/**
 * Folders to include in every bundles, even if they are not implicitly imported.
 * Useful for async import.
 */
const includedFoldersWithoutImports = ['pages', 'components'];

/**
 * Set to false to include all CSS files as JS bundles.
 * Allows HMR and code splitting for CSS.
 * Set to a 'filename.css' to generate a unique css bundle including every css instructions.
 */
const cssBundleFile = false;

/**
 * Include those libs into the vendors bundle.
 * Will include using http://fuse-box.org/page/configuration#shimming
 * Through fuse-helpers to ease writing. @see ./helpers/fuse-helper.js#generateShims
 */
const vendorShims = {

	// GSAP lib from node_modules
	'node_modules/gsap/' : [

		// TweenLite core
		'TweenLite.js',
		'TimelineLite.js',

		// Easings
		'EasePack.js',

		// Plugins
		//'AttrPlugin.js',
		'BezierPlugin.js',
		'ColorPropsPlugin.js',
		//'CSSPlugin.js',
		//'CSSRulePlugin.js',
		'DirectionalRotationPlugin.js',
		//'Draggable.js',
		//'EaselPlugin.js',
		//'EndArrayPlugin.js',
		//'jquery.gsap.js',
		'ModifiersPlugin.js',
		//'PixiPlugin.js',
		//'RaphaelPlugin.js',
		'RoundPropsPlugin.js',
		'ScrollToPlugin.js',
		//'TextPlugin.js',
	],

	// Import shim mapper to patch global declarations
	'./' : [
		`${src}ShimMapping.js`
	]
};


// ----------------------------------------------------------------------------- FUSE BOX CONFIG

// List of app bundles
let appBundles = [];

// Fuse and options on global scope
let fuse;
let options;

Sparky.task('config:fuse', () =>
{
	// Init fuse box
	fuse = FuseBox.init({

		// Sources directory
		homeDir: src,

		// JS bundles output files
		output: `${dist}$name.js`,

		// Typescript config file
		tsConfig: 'tsconfig.json',

		// Require those libs with module properties
		useJsNext: ['react', 'react-dom'],

		// @see : http://fuse-box.org/page/configuration#polyfillnonstandarddefaultusage
		polyfillNonStandardDefaultUsage: ['react', 'react-dom'],

		// Use experimental features like dynamic imports
		// @see : http://fuse-box.org/page/dynamic-import
		experimentalFeatures: true,

		// Output format, we support es5 if legacy mode is enabled
		target: 'browser@' + (legacySupport ? 'es5' : 'es6'),

		// Use hashes and disable cache when building with Quantum
		hash: options.uglify,
		cache: !options.quantum,

		// Enable sourcemaps if we don't uglify output
		sourceMaps: !options.uglify,

		// Enable debugging from options
		log: options.verbose,
		debug: options.verbose,


		// TODO ?
		/*
		alias: {
			'solidify' : 'solidify-lib'
		},
		*/

		plugins: [
			// Styling config
			[
				// @see : http://fuse-box.org/plugins/less-plugin
				LESSPlugin({
					// FIXME : Not working now... See also PostCSS sourceMap config if enabled.
					//sourceMap: true,
					paths: [
						// FIXME : Trouver une solution pour l'autocomplete PHPStorm + alias ?
						path.resolve( __dirname ),
						path.resolve( __dirname, 'node_modules' )
					]
				}),

				// @see : http://fuse-box.org/plugins/post-css-plugin
				PostCSSPlugin([

					// @see : https://github.com/postcss/autoprefixer
					require('autoprefixer')({

						// BrowersList syntax : https://github.com/ai/browserslist
						browsers: [
							// All browsers version supports
							`last ${legacySupport ? 4 : 2} versions`,

							// IE and Edge support
							(legacySupport ? `ie >= 11` : 'edge >= 10'),

							// iOS Support
							`iOS >= ${legacySupport ? 7 : 10}`
						]
					}),

					// Clean output CSS
					require('postcss-clean')({
						// Map base for all url statements
						// FIXME : REBASE ?
						//rebaseTo: '/test',

						// Keeps breaks on uglify mode and beautify otherwise
						format: ( options.uglify ? 'keep-breaks' : 'beautify' ),
						advanced: true
					})
				]),

				// @see : http://fuse-box.org/plugins/css-resource-plugin
				CSSResourcePlugin({

					// Write resources to that folder
					dist: `${dist}${resources}`,

					// FIXME : A tester et à exposer en haut
					// Include images as Base64 into bundle
					//inline: true

					// Rewriting resources paths
					//resolve: (f) => `/resources/${f}`
				}),

				// @see : http://fuse-box.org/plugins/css-plugin
				// Export a CSS file and do not inject CSS into JS bundles if cssBundleFile is a string
				CSSPlugin( !cssBundleFile ? {} : {
					group: cssBundleFile,
					outFile: `${dist}${cssBundleFile}`
				})
			],

			// Convert node env to production if we use quantum
			EnvPlugin({
				NODE_ENV: ( options.quantum ? 'production' : 'development' )
			}),

			// Inject typescript helpers into bundles
			TypeScriptHelpers(),

			// Generate index.html from template
			generateWebIndex
			&&
			WebIndexPlugin({
				template: `${src}index.html`,
				path: './'
				//path: './assets/',
				//target: '../index.html',
				//resolve : output => 'assets/'+output.lastPrimaryOutput.filename
			}),

			// Compress and optimize bundle with Quantum on production
			// @see : https://github.com/fuse-box/fuse-box/blob/master/docs/quantum.md
			options.quantum
			&&
			QuantumPlugin({
				// Inject Quantum API into vendors bundle
				bakeApiIntoBundle: vendorsBundleName,

				// Enable tree-shaking capability
				treeshake: true,

				// Uglify output on production
				// Will use uglify-es on non legacy mode
				uglify: (
					options.uglify
					? { es6 : !legacySupport }
					: false
				),

				// Generate a manifest.json file containing bundles list if no index.html is built
				manifest: (generateWebIndex ? false : 'quantum.json'),

				// Promise API support for legacy browsers
				polyfills: legacySupport ? ['Promise'] : [],

				// ES5 compatible in legacy mode
				ensureES5 : legacySupport
			})
		]
	});
});

// ----------------------------------------------------------------------------- BUNDLES CONFIG

Sparky.task('config:bundles', () =>
{
	/**
	 * VENDOR BUNDLE
	 */

	// Configure vendors bundle, add it to app bundles
	appBundles.push(

		fuse.bundle( vendorsBundleName )

			// Contains everything but the app files
			.instructions(`~ ${entryPoint}`)

			// Include shimmed libs
			// @see : http://fuse-box.org/page/configuration#shimming
			// Through fuse-helpers to ease writing. @see ./helpers/fuse-helper.js#generateShims
			.shim(
				generateShims( vendorShims )
			)

			// Globals exports
			// @see : http://fuse-box.org/page/configuration#global-variables
			.globals({ })
	);


	/**
	 * MAIN APP BUNDLE
	 */

	// Init main app bundle and add it to app bundles
	const mainApp = fuse.bundle('mainApp');
	appBundles.push(mainApp);

	// We use this helper to get async modules list from file system using this glob
	getAsyncBundlesFromFileSystem( `${src}${async}*/*.tsx` ).map( (asyncEntry) =>
	{
		// Here we define code splitting instructions.
		// @see : http://fuse-box.org/page/code-splitting#instructions
		mainApp.split(

			// Match every file inside bundle directory
			`${ async }${ asyncEntry.bundleName }/**`,

			// Name of the bundle > Entry point of the bundle
			`${ asyncEntry.bundleName } > ${ async }${ asyncEntry.bundleName }/${ asyncEntry.entryPoint }`
		);
	});

	// Main app compilation instruction
	mainApp.instructions([

		// Setup and auto-start application entry point
		`!> [${ entryPoint }]`,

		// Include non imported folders like pages/ and components/
		`+ [${ includedFoldersWithoutImports.join(',') }/**.tsx]`,

		// Include non imported async files, Quantum will split the bundle
		`+ [${ async }**/${ includedFoldersWithoutImports.join(',') }/**.tsx]`

	].join(' '));


	/**
	 * WATCH AND DEV MODE
	 */

	// If we are not in production mode
	if ( !options.quantum )
	{
		// Enable embedded server for HMR reloading
		fuse.dev({
			port: options.port
		});

		// Enable watch / HMR and sourceMaps on every bundles
		appBundles.map( (app) =>
		{
			if ( app.name === vendorsBundleName ) return;

			app.hmr({reload: options.reload});
			app.watch();
		});
	}
});


// ----------------------------------------------------------------------------- BUNDLES CONFIG

/**
 * Configure Typescript Checker
 */
Sparky.task('config:typeHelper', () =>
{
	// TODO : A notypecheck option to discard this ?

	// Create TypeHelper
	let typeHelper = TypeHelper({
		tsConfig: './tsconfig.json',
		basePath:'./',
		// TODO : Check this
		//tsLint:'./tslint.json', //you do not haveto do tslint too.. just here to show how.
		name: 'TypeChecker'
	});

	// Browser every bundles
	appBundles.map( app =>
	{
		// Do not listen vendors app
		if (app.name === vendorsBundleName) return;

		// When an app complete compilation
		app.completed( (proc) =>
		{
			// Do not type check vendors
			if (proc.bundle.name === vendorsBundleName) return;

			console.log(`\x1b[36m%s\x1b[0m`, `Typechecking ${proc.bundle.name} ...`);

			typeHelper.runSync();
		});
	});
});


// ----------------------------------------------------------------------------- CLI

/**
 * Prepare options from CLI
 */
Sparky.task('config:options', () =>
{
	options = cli.options;
});

/**
 * Force options for production
 */
Sparky.task('config:production', () =>
{
	options = {
		quantum: true,
		uglify: true,
		reload: false,
		verbose: false
	};
});

/**
 * Start and configure CLI
 */
const cli = CLI({
	options: {
		'quantum':  {
			type: 'boolean',
			default: false
		},
		'uglify' : {
			type: 'boolean',
			default: false
		},
		'reload' : {
			type: 'boolean',
			default: false
		},
		'port' : {
			type: 'number',
			default: 4445
		},
		'verbose' : {
			type: 'boolean',
			default: false
		},
	},
	taskDescriptions: {
		'default' : 'Show this message',
		'run' : `
			Run fuse and compile all bundles.

			@param --quantum
				- Enable code splitting, async modules will be in separated bundled files.
				- Enable treeshaking
				- Disable Hot Module Reloading and changes watching

			@param --uglify
				- Uglify bundles
				- Works only if quantum is enabled

			@param --reload
				- Force full page reloading and disable Hot Module Reloading

			@param --port
				- Change HMR listening port, if running other fuse projects at the same time.
				- Default is 4445
			@param --verbose
				- Enable debug and verbose mode on fuse
		`,
		'production' : `
			Run fuse and compile all bundles with quantum and uglify parameters enabled.
		`
	}
});

/**
 * Default task : show help panel
 */
Sparky.task('default', () =>
{
	cli.showHelp( true );
});


// ----------------------------------------------------------------------------- TASKS

/**
 * Config tasks to be able to build.
 * Needs options before.
 */
let configTasks = ['config:fuse', 'config:bundles', 'config:typeHelper'];

/**
 * Load configs and run fuse !
 * Will read options from CLI.
 */
Sparky.task('run', ['config:options'].concat( configTasks ), () =>
{
	fuse.run();
});

/**
 * Load configs and run fuse !
 * Will force options for production.
 */
Sparky.task('production', ['config:production'].concat( configTasks ), () =>
{
	fuse.run();
});