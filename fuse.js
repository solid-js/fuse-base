
// ----------------------------------------------------------------------------- TODO ZONE

/**
 * TODO :
 * - Refacto du framework avec nouvelle API
 * - Deployer
 * - Sprite generator
 * - SVG plugin ?
 * - IMG ?
 * - IMG base 64 ?
 * - React en production mode ?
 * - http://fuse-box.org/plugins/banner-plugin ?
 *
 * BETTER :
 * - Test inferno à la place de react
 * - If possible : assets folder, this is cleaner !
 * - tsconfig JSON5
 *
 */


// ----------------------------------------------------------------------------- IMPORTS

const {
	FuseBox,
	CLI,
	EnvPlugin,
	WebIndexPlugin,
	QuantumPlugin,
	LESSPlugin,
	PostCSSPlugin,
	CSSPlugin,
	CSSResourcePlugin
} = require("fuse-box");

//const Sparky = require("fuse-box/sparky");

const colors = require('colors'); // @see : https://github.com/marak/colors.js/
const path = require("path");

const { TypeHelper } = require('fuse-box-typechecker');

const { getAsyncBundlesFromFileSystem } = require("./helpers/fuse-helpers");
const { Files, Folder } = require("./helpers/file-list");


// ----------------------------------------------------------------------------- PATHS AND CONSTANTS

// Source folder
const srcPath = 'src/';

// Output directory
const distPath = 'dist/';

// Bundle path from dist path
const bundlesPath = 'assets/bundles/';

// Compiled resources folder (inside dist)
const resourcesPath = 'assets/resources/';

// Default apps entry point
const entryPoint = 'index.ts';

// Async bundle folders (inside src)
const asyncPath = 'async/';

// Vendors bundle name
const vendorsBundleName = 'vendors';


// ----------------------------------------------------------------------------- CONFIG

/**
 * Generate an index.html from template.
 * If false, and quantum is enabled, will generate a quantum.json manifest file.
 * If enabled, dist/index.html will be removed when cleaning.
 */
const generateWebIndex = true;

/**
 * Support old browsers like IE 11 or iOS 7
 */
const legacySupport = true;

/**
 * Folders to include in every bundles, even if they are not implicitly imported.
 * Useful for async import.
 */
const includedFoldersWithoutImports = ['elements', 'components', 'pages'];

/**
 * Default included extensions for not implicit imports.
 */
const extensions = ['ts', 'tsx', 'less'];

/**
 * Set to false to include all CSS files as JS bundles.
 * Allows HMR and code splitting for CSS.
 * Set to a 'filename.css' to generate a unique css bundle including every css instructions.
 */
const cssBundleFile = false; // `${bundlesPath}styles.css`;

/**
 * TODO : WIP
 */
const vendorShims = {};


// ----------------------------------------------------------------------------- FUSE BOX CONFIG

// List of app bundles
let appBundles = [];

// Fuse and options on global scope
let fuse;
let options;

Sparky.task('config:fuse', () =>
{
	// Init fuse box if not already done
	if (fuse) return;
	fuse = FuseBox.init({

		// Sources directory
		homeDir: srcPath,

		// Bundles output path format
		output: `${distPath}${bundlesPath}$name.js`,

		// Typescript config file
		tsConfig: 'tsconfig.json',

		// Force typescript compiler on JS files
		useTypescriptCompiler : true,

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

		// @see : http://fuse-box.org/page/configuration#alias
		alias: { },

		// @see : https://fuse-box.org/page/configuration#auto-import
		autoImport : {

			// Will automatically var Inferno = require('inferno') when a script is using Inferno.anything ...
			// Inferno: "inferno"
		},

		plugins: [
			// Styling config
			[
				// @see : http://fuse-box.org/plugins/less-plugin
				LESSPlugin({
					// FIXME : Not working now... See also PostCSS sourceMap config if enabled.
					sourceMap: false,

					// Disable IE-compat so data-uri can be huge
					ieCompat: false,

					// Add root folder as base path for less so we can @import files from node_modules
					paths: [
						path.resolve( __dirname )
					]
				}),

				// @see : http://fuse-box.org/plugins/post-css-plugin
				PostCSSPlugin(
					// PostCSS plugins
					[
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
							// Keeps breaks on uglify mode and beautify otherwise
							format: ( options.uglify ? 'keep-breaks' : 'beautify' ),
							advanced: true
						})
					],
					// PostCSS options
					{
						sourceMaps: false,
						from: 0
					}
				),

				// @see : http://fuse-box.org/plugins/css-resource-plugin
				CSSResourcePlugin({

					// Write resources to that folder
					dist: `${distPath}${resourcesPath}`,

					// Rewriting resources paths
					resolve: (f) => `${resourcesPath}${f}`,

					// Include images as Base64 into bundle
					// Please use Less data-uri instead @see http://lesscss.org/functions/#misc-functions-data-uri
					//inline: true
				}),

				// @see : http://fuse-box.org/plugins/css-plugin
				// Export a CSS file and do not inject CSS into JS bundles if cssBundleFile is a string
				CSSPlugin( !cssBundleFile ? {} : {
					group: cssBundleFile,
					outFile: `${distPath}${cssBundleFile}`
				})
			],

			// EnvPlugin for process.env emulation in the browser @see https://fuse-box.org/page/env-plugin
			EnvPlugin({
				// Convert node env to production if we use quantum
				NODE_ENV: ( options.quantum ? 'production' : 'development' ),

				// Inject package.json version
				VERSION: require('./package.json').version
			}),

			// Generate index.html from template
			generateWebIndex
			&&
			WebIndexPlugin({
				// Index template
				template: `${srcPath}index.html`,

				// Relative path to bundles
				path: bundlesPath,
				//resolve : output => 'assets/'+output.lastPrimaryOutput.filename

				// Index file name, relative to bundle path, cheap trick
				target: '../../index.html',
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

				// ??
				//target : 'browser',
				//replaceTypeOf: true

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
		.shim( vendorShims )

		// Globals exports
		// @see : http://fuse-box.org/page/configuration#global-variables
		//.globals({ })
	);


	/**
	 * MAIN APP BUNDLE
	 */

	// Glob string to target all included extensions files
	const extensionsGlob = `+(${extensions.join('|')})`;

	// Glog string to target included folders
	const includedFoldersGlob = `+(${includedFoldersWithoutImports.join('|')})`;

	// Init main app bundle and add it to app bundles
	const mainApp = fuse.bundle('mainApp');
	appBundles.push(mainApp);

	// Configure code splitting
	mainApp.splitConfig({

		// Relative path from main bundle to load code splitted bundles
		browser: `assets/bundles/`,

		// Where to put async bundles. Default is same directory than regular bundles.
		//dest: `assets/bundles/`
	});

	// We use this helper to get async modules list from file system using this glob
	getAsyncBundlesFromFileSystem( `${srcPath}${asyncPath}*/*.+(ts|tsx)` ).map( (asyncEntry) =>
	{
		// Here we define code splitting instructions.
		// @see : http://fuse-box.org/page/code-splitting#instructions
		mainApp.split(

			// Match every file inside bundle directory
			`${ asyncPath }${ asyncEntry.bundleName }/**`,

			// Name of the bundle > Entry point of the bundle
			`${ asyncEntry.bundleName } > ${ asyncPath }${ asyncEntry.bundleName }/${ asyncEntry.entryPoint }`
		);
	});

	// Main app compilation instruction
	mainApp.instructions([

		// Setup and auto-start application entry point
		`!> [${ entryPoint }]`,

		// FIXME : Does not work ???

		// Include non imported folders like pages/ and components/
		`+ [${includedFoldersGlob}/*/*.${extensionsGlob}]`,

		// Include non imported async files, Quantum will split the bundle
		`+ [${ asyncPath }*/${includedFoldersGlob}/*/*.${extensionsGlob}]`,

	].join(' '));

	/**
	 * WATCH AND DEV MODE
	 */

	// If we are not in production mode
	if ( !options.quantum )
	{
		// Enable embedded server for HMR reloading
		fuse.dev({
			port: options.port,
			httpServer: false
		});

		// Enable watch / HMR on bundles
		appBundles.map( (app) =>
		{
			// Watch all bundles
			app.watch();

			// Do not HMR vendor bundle
			// FIXME ? Otherwise TypeChecking will dispatch 2 page reload
			if ( app.name === vendorsBundleName ) return;

			// Launch HMR and watch
			app.hmr({ reload: options.reload });
		});
	}
});


// ----------------------------------------------------------------------------- BUNDLES CONFIG

/**
 * Configure Type Checker
 */
Sparky.task('config:typeChecking', () =>
{
	// Disabled type checking from options
	if (options.noTypeCheck)
	{
		console.log(`\n > Warning, type checking disabled.`.red.bold);
		return;
	}

	// Create TypeHelper
	// @see : https://github.com/fuse-box/fuse-box-typechecker
	let typeHelper = TypeHelper({
		name: 'TypeChecker',
		tsConfig: '../tsconfig.json',
		basePath: srcPath,
		shortenFilenames: true,

		// Tslint file ?
		//tsLint:'./tslint.json'
	});

	// Shortcut method to run Type Checking with alerts if anything failed
	const runTypeCheck = ( bundleName ) =>
	{
		// Type checking can be long, so we show this to know what is going on
		console.log(`\nTypechecking ${bundleName} ...`.cyan);

		// Run type checker
		const totalErrors = typeHelper.runSync();

		// If we have errors
		// Play a sound from the terminal if there is an error
		(totalErrors > 0)
			? console.log("\007")
			: console.log(`Bundle ${bundleName} checked !`.green);

		// Quit with an error if we are in quantum mode
		if (options.quantum && totalErrors > 0)
		{
			process.exit(1);
		}
	}

	// Browser every bundles
	appBundles.map( app =>
	{
		// Do not listen vendors app to type check
		if (app.name === vendorsBundleName) return;

		// Do not watch to TypeCheck if we are Quantum is enabled
		if ( options.quantum )
		{
			// We TypeCheck directly
			runTypeCheck( app.name );
			return;
		}

		// When an app complete compilation
		app.completed( (proc) =>
		{
			// Do not type check vendors
			if (proc.bundle.name === vendorsBundleName) return;
			runTypeCheck( proc.bundle.name );
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
		verbose: false,
		noTypeCheck: false
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
		'noTypeCheck' : {
			type: 'boolean',
			default: false
		},
	},
	taskDescriptions: {
		'default' : 'Show this message',
		'dev' : `
			Run fuse, compile all bundles and watch.

			${'@param --quantum'.bold}
				- Enable code splitting, async modules will be in separated bundled files.
				- Enable treeshaking
				- Disable Hot Module Reloading and changes watching

			${'@param --uglify'.bold}
				- Uglify bundles
				- Works only if quantum is enabled

			${'@param --reload'.bold}
				- Force full page reloading and disable Hot Module Reloading

			${'@param --port'.bold}
				- Change HMR listening port, if running other fuse projects at the same time.

			${'@param --verbose'.bold}
				- Enable debug and verbose mode on fuse

			${'@param --noTypeCheck'.bold}
				- Disable type checking, only for quick tests !
		`,
		'production' : `
			Run fuse and compile all bundles for production (Quantum + Uglify enabled).
		`,
		'clean' : `
			Clean fuse cache. Automatically done before dev and production tasks. 
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


// ----------------------------------------------------------------------------- FILES


// ----------------------------------------------------------------------------- TASKS

/**
 * Remove all FuseBox caches.
 */
Sparky.task('clean', () =>
{
	// Clear cache before each command
	Folder('.fusebox').delete();

	// Remove every compiled bundles
	Folder(`${distPath}${bundlesPath}`).delete();

	// Remove compiled html if we have one
	generateWebIndex
	&&
	Files(`${distPath}index.html`).delete();

	// Remove resources
	Folder( resourcesPath ).delete();
});

/**
 * Config tasks to be able to build.
 * Needs options before.
 */
let configTasks = ['config:fuse', 'config:bundles', 'config:typeChecking'];

/**
 * Load configs and run fuse !
 * Will read options from CLI.
 */
Sparky.task('dev', ['clean', 'config:options'].concat( configTasks ), () =>
{
	fuse.run();
});

/**
 * Load configs and run fuse !
 * Will force options for production.
 */
Sparky.task('production', ['clean', 'config:production'].concat( configTasks ), () =>
{
	fuse.run();
});




// ----------------------------------------------------------------------------- /!\ TESTING ZONE /!\


/*
Sparky.task('testSparky', () =>
{
	console.log('TEST SPARKY');

	Sparky.src("testfile.json").file("*", file =>
	{
		console.log( file );
	}).exec();

	console.log('after');
});
*/


Sparky.task('testFile', () =>
{
	/*
	console.log('TEST FILE 1');
	Files('dist/assets/bundles/**').all( file => console.log( '> ' + file ) );
	*/

	/*
	console.log('TEST FOLDER 1');
	Folder('dist/assets/bundles/').all( file => console.log( '> ' + file ) );
	*/

	/*
	console.log('TEST FOLDER 2');
	Folder('dist/assets/bundles/').delete();
	*/

	/*
	console.log('TEST FILES MOVE');
	Files('dist/assets/bundles/**').moveTo('dist/test/');
	*/

	/*
	console.log('TEST FILES COPY');
	Files('dist/assets/bundles/**').copyTo('dist/test/');
	*/
});