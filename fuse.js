
// ----------------------------------------------------------------------------- TODO ZONE

/**
 * TODO :
 * - Refacto du framework avec nouvelle API
 * - Deployer
 *
 * A TESTER :
 * - IMG base 64 ?
 * - React en production mode ?
 *
 * BETTER :
 * - Test inferno à la place de react ?
 * - tsconfig JSON5 ?
 */


// ----------------------------------------------------------------------------- IMPORTS

// Get Fusebox and its modules
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
const Sparky = require("fuse-box/sparky");

// Some colors in the terminal
const colors = require('colors'); // @see : https://github.com/marak/colors.js/

// Node path utils
const path = require('path');

// Get Typescript checking helper
const { TypeHelper } = require('fuse-box-typechecker');

// Quick template utils
const { QuickTemplate } = require('./helpers/quick-template');

// Get fuse helpers
const { getAsyncBundlesFromGlob, filterShimsForQuantum } = require("./helpers/fuse-helpers");

// Get Files helper for easy Files/Folder manipulating
const { Files } = require("./helpers/files");

// Get fuse switches
const switches = require('./fuse-switches');


// ----------------------------------------------------------------------------- FUSE BOX CONFIG

// List of app bundles
let allBundles = [];

// Fuse and options on global scope
let fuse;
let options;

Sparky.task('config:fuse', () =>
{
	// Init fuse box if not already done
	if (fuse) return;
	fuse = FuseBox.init({

		// Sources directory
		homeDir: switches.srcPath,

		// Bundles output path format
		output: `${switches.distPath}${switches.bundlesPath}$name.js`,

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
		target: 'browser@' + (switches.legacySupport ? 'es5' : 'es6'),

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
					// Disable sourcemaps because css are included into JS bundles
					sourceMap: false,

					// Disable IE-compat so data-uri can be huge
					ieCompat: false
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
								`last ${switches.legacySupport ? 4 : 2} versions`,

								// IE and Edge support
								(switches.legacySupport ? `ie >= 11` : 'edge >= 10'),

								// iOS Support
								`iOS >= ${switches.legacySupport ? 7 : 10}`
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
					dist: `${switches.distPath}${switches.resourcesPath}`,

					// Rewriting resources paths
					resolve: (f) => `${switches.resourcesPath}${f}`,

					// Include images as Base64 into bundle
					// Please use Less data-uri instead @see http://lesscss.org/functions/#misc-functions-data-uri
					//inline: true
				}),

				// @see : http://fuse-box.org/plugins/css-plugin
				// Export a CSS file and do not inject CSS into JS bundles if cssBundleFile is a string
				CSSPlugin( !switches.cssBundleFile ? {} : {
					group: switches.cssBundleFile,
					outFile: `${switches.distPath}${switches.cssBundleFile}`
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
			switches.generateWebIndex
			&&
			WebIndexPlugin({
				// Index template
				template: `${switches.srcPath}index.html`,

				// Relative path to bundles
				path: switches.bundlesPath,
				//resolve : output => 'assets/'+output.lastPrimaryOutput.filename

				// Index file name, relative to bundle path, cheap trick
				target: '../../index.html'
			}),

			// Compress and optimize bundle with Quantum on production
			// @see : https://github.com/fuse-box/fuse-box/blob/master/docs/quantum.md
			options.quantum
			&&
			QuantumPlugin({
				// Inject Quantum API into vendors bundle
				bakeApiIntoBundle: switches.vendorsBundleName,

				// Tree-shaking capability
				treeshake: {

					// Prevent file to be removed
					shouldRemove: (file) =>
					{
						// Never remove an entry point
						if ( path.basename(file.fuseBoxPath) === switches.entryPoint )
						{
							return false
						}
					}
				},

				// Uglify output on production
				// Will use uglify-es on non legacy mode
				uglify: (
					options.uglify
					? { es6 : !switches.legacySupport }
					: false
				),

				// Generate a manifest.json file containing bundles list if no index.html is built
				manifest: (switches.generateWebIndex ? false : 'quantum.json'),

				// Promise API support for legacy browsers
				polyfills: switches.legacySupport ? ['Promise'] : [],

				// ES5 compatible in legacy mode
				ensureES5 : switches.legacySupport
			})
		]
	});
});

// ----------------------------------------------------------------------------- BUNDLES CONFIG

Sparky.task('config:bundles', () =>
{
	// Get app bundles list from file system
	const appBundlesNames = Files.getFolders(`${switches.srcPath}*`).all( folder => path.basename( folder ) );

	// Glob string to target all included extensions files
	const extensionsGlob = `+(${ switches.extensions.join('|') })`;

	// Glog string to target included folders
	const includedFoldersGlob = `+(${ switches.includedFoldersWithoutImports.join('|') })`;


	/**
	 * VENDOR BUNDLE
	 */

	// Configure vendors bundle, add it to bundles list
	allBundles.push(

		// Create vendor bundle
		fuse.bundle( switches.vendorsBundleName )

		// Contains everything but app bundles dependencies
		.instructions(
			appBundlesNames.map(
				appBundleName => `~ ${appBundleName}/${switches.entryPoint}`
			)
			.join(' ')
		)

		// Include shimmed libs
		// @see : http://fuse-box.org/page/configuration#shimming
		.shim(
			// Filter shims for quantum compiling
			// We use this special filter because some libs like Zepto or jQuery
			// does not work as shimmed library when quantum is enabled.
			filterShimsForQuantum( switches.vendorShims, options.quantum )
		)

		// Globals exports
		// @see : http://fuse-box.org/page/configuration#global-variables
		//.globals({ })
	);


	/**
	 * APP BUNDLES
	 */

	// Browser app bundles
	appBundlesNames.map( appBundleName =>
	{
		// Bundles instructions to know which file to include or exclude from the bundle
		const bundleInstructions = [
			// Auto start only common bundle
			`!${ appBundleName === switches.commonBundleName ? '>' : '+'}`,

			// Add entry point
			`[${ appBundleName }/${ switches.entryPoint }]`,
		];

		// If this is the common bundle
		if ( appBundleName === switches.commonBundleName )
		{
			// We include every file, even if they are not included
			bundleInstructions.push(`+ [${ appBundleName }/**/*.${ extensionsGlob }]`);
		}
		else
		{
			// Include non imported folders like pages/ and components/
			bundleInstructions.push(`+ [${ appBundleName }/${ includedFoldersGlob }/*/*.${ extensionsGlob }]`);

			// Include non imported async files, Quantum will split the bundle
			bundleInstructions.push(`+ [${ appBundleName }/${ switches.asyncPath }*/${ includedFoldersGlob }/*/*.${ extensionsGlob }]`);
		}

		// Brower other bundles
		appBundlesNames.map( otherAppBundleName =>
		{
			// Remove other app bundles dependencies
			// so shared files are only included into their own bundle
			if (otherAppBundleName !== appBundleName)
			{
				bundleInstructions.push(`- [${ otherAppBundleName }/**/*.${ extensionsGlob }]`);
			}
		});

		// Create bundle from its name and instructions
		const currentAppBundle = fuse.bundle(
			// Patch common bundle name
			appBundleName === switches.commonBundleName ? switches.commonFileName : appBundleName
		);
		currentAppBundle.instructions(
			bundleInstructions.join(' ')
		);

		// If this is not the common bundle
		// We add code splitting options
		if ( appBundleName !== switches.commonBundleName )
		{
			// Configure code splitting
			currentAppBundle.splitConfig({

				// Relative path from main bundle to load code splitted bundles
				browser: switches.bundlesPath,

				// Where to put async bundles. Default is same directory than regular bundles.
				//dest: switches.bundlesPath
			})

			// We use this helper to get async modules list from file system using this glob
			getAsyncBundlesFromGlob( `${ switches.srcPath }${ appBundleName }/${ switches.asyncPath }*/*.+(ts|tsx)` ).map( asyncEntry =>
			{
				// Here we define code splitting instructions.
				// @see : http://fuse-box.org/page/code-splitting#instructions
				currentAppBundle.split(

					// Match every file inside bundle directory
					`${ appBundleName }/${ switches.asyncPath }${ asyncEntry.bundleName }/**`,

					// Name of the bundle > Entry point of the bundle
					`${ asyncEntry.bundleName } > ${ appBundleName }/${ switches.asyncPath }${ asyncEntry.bundleName }/${ asyncEntry.entryPoint }`
				);
			});
		}

		// Add this new bundle to bundle list
		allBundles.push( currentAppBundle );
	});



	/**
	 * WATCH AND DEV MODE
	 */

	// If we are not in production mode
	if ( !options.quantum )
	{
		// Enable embedded server for HMR reloading
		fuse.dev({
			port: options.port,
			httpServer: switches.useEmbeddedServer,
			open: switches.useEmbeddedServer,
			root: switches.distPath
		});

		// Enable watch / HMR on bundles
		allBundles.map( (app) =>
		{
			// Watch all bundles
			app.watch();

			// Do not HMR vendor bundle
			// FIXME ? Otherwise TypeChecking will dispatch 2 page reload
			if ( app.name === switches.vendorsBundleName ) return;

			// Launch HMR and watch
			app.hmr({
				port: options.port,
				reload: options.reload
			});
		});
	}

	/**
	 * BUNDLES TO REQUIRE INTO COMMON
	 */

	/**
	 * TODO : DOC
	 */

	// Get all app bundles but common
	let appsToRequire = appBundlesNames.filter( bundleName => bundleName !== switches.commonBundleName )

	// Create a file that requires those app bundles so common can bootstrap them
	Files.new(`${switches.srcPath}${switches.commonBundleName}/bundles.ts`).write(
		QuickTemplate(
			Files.getFiles('skeletons/scaffold/commonBundleRequire').read(),
			{
				appsToRequire: appsToRequire.map( bundleNameToRequire => `		require('../${ bundleNameToRequire }/index')` ).join(",\n")
			}
		)
	)
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
		basePath: switches.srcPath,
		shortenFilenames: true
	});

	// Shortcut method to run Type Checking with alerts if anything failed
	const runTypeCheck = () =>
	{
		// Type checking can be long, so we show this to know what is going on
		console.log(`\nType checking bundles ...`.cyan);

		// Run type checker
		const totalErrors = typeHelper.runSync();

		// If we have errors
		// Play a sound from the terminal if there is an error
		(totalErrors > 0)
		? console.log("\007")
		: console.log(`Bundles checked !`.green);

		// Quit with an error if we are in quantum mode
		if (options.quantum && totalErrors > 0)
		{
			process.exit(1);
		}
	}

	// Bundle completion counter to type check only when every bundles are compiled
	let completedBundles = 0;

	// Browser every bundles
	allBundles.map( app =>
	{
		// When an app complete compilation
		app.completed( proc =>
		{
			if (completedBundles === 0) console.log('');
			console.log(`Bundle ${proc.bundle.name} compiled.`.green);

			// Count until every bundle are compiled
			if (++completedBundles >= allBundles.length)
			{
				// Reset counter
				completedBundles = 0;

				// Run typecheck on all bundle at once
				runTypeCheck( proc.bundle.name );
			}
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
	options.quantum = true;
	options.uglify = true;
	options.reload = false;
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
		'noLessCheck' : {
			type: 'boolean',
			default: false
		},
	},

	// TODO : DOES NOT WORK ANYMORE ?

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

			${'@param --verbose'.bold}
				- Enable debug and verbose mode on fuse

			${'@param --noLessCheck'.bold}
				- Disable less checking in production

			${'@param --noTypeCheck'.bold}
				- Disable type checking, only for quick tests !
		`,
		'clean' : `
			Clean fuse cache. Automatically done before dev and production tasks. 
		`,
		'cleanSprites' : `
			Clean generated sprites.
		`,
		'scaffold' : `
			Create a new component interactively. 
		`,
		'sprites' : `
			Process and compile sprites. 
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
 * Remove all FuseBox caches.
 */
Sparky.task('clean', () =>
{
	// Clear cache before each command
	Files.getFolders('.fusebox').delete();

	// Remove every compiled bundles
	Files.getFolders(`${switches.distPath}${switches.bundlesPath}`).delete();

	// Remove compiled html if we have one
	switches.generateWebIndex
	&&
	Files.getFiles(`${switches.distPath}index.html`).delete();

	// Remove resources
	Files.getFolders( switches.resourcesPath ).delete();
});

/**
 * Clean generated sprites
 */
Sparky.task('cleanSprites', () =>
{
	// Remove generated PNG sprites
	Files.getFolders(`${switches.distPath}${switches.spritesPath}`).delete();

	// Remove generated JSON and LESS files ?
	//Files.getFiles()
});

/**
 * Check every less file because fuse will silently fail if there is a less error.
 */
Sparky.task('lessCheck', () =>
{
	// Disabled less checking from options
	if (options.noLessCheck)
	{
		console.log(`\n > Warning, less checking disabled.`.red.bold);
		return;
	}

	// Spawn less compiler as a new process
	let spawn = require('child_process').spawnSync;

	// Browser every files.
	// BETTER : Only check not already check files.
	Files.getFiles(`${switches.srcPath}**/*.less`).all( file =>
	{
		console.log(`Checking ${file} ...`.grey);

		// Lint with lessc, do not compile anything
		let lessLint = spawn('./node_modules/less/bin/lessc', ['--no-ie-compat', '--lint', '--no-color', file]);

		// Get error
		let stderr = lessLint.stderr.toString();

		// Exit with error code if there is anything wrong
		if (stderr !== '')
		{
			console.log( stderr.red.bold );
			console.log("\007");
			process.exit(1);
		}
	});
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
Sparky.task('production', ['clean', 'config:options', 'config:production', 'lessCheck'].concat( configTasks ), () =>
{
	fuse.run();
});

/**
 * Create a new component interactively
 */
Sparky.task('scaffold', async () =>
{
	return require('./fuse-scaffold');
});

/**
 * Process and compile sprites.
 */
Sparky.task('sprites', async () =>
{
	return require('./fuse-sprites');
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