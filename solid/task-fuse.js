// Get Fusebox and its modules
const {
	FuseBox,
	EnvPlugin,
	WebIndexPlugin,
	QuantumPlugin,
	LESSPlugin,
	PostCSSPlugin,
	CSSPlugin,
	CSSResourcePlugin
} = require("fuse-box");

// Node path utils
const path = require('path');

// File manager
const { Files } = require('@zouloux/files');

// Get fuse config
const fuseConfig = require('../solid-fuse.config');

// Capitalize First letter helper
const { CapitalizeFirst } = require('./helper-capitalize');

// Get package.json to read packageversion
const packageJson = require('../package.json');

// Load solid constants
const solidConstants = require('../solid-constants.config');


// ----------------------------------------------------------------------------- CLI OPTIONS

// Options from CLI and init overridden
let options;

/**
 * Init options from CLI and override
 * @param pOptionsOverride Options to override
 * @private
 */
const _initCLIOptions = (pOptionsOverride) =>
{
	// Get options from argv with default values
	options = require('./solid-tasks').getOptions({
		quantum		: false,
		uglify		: false,
		reload		: false,
		port		: 4445,
		quiet 		: false,
		noTypeCheck	: false,
		noLessCheck	: false,
		noWatch		: false
	}, pOptionsOverride);
};


// ----------------------------------------------------------------------------- INIT DEPENDENCIES LIST

// All app bundle names
let appBundlesNames;

// All pages by bundle
let allPagesByBundles = {};

/**
 * List static dependencies list from file system.
 * Will get bundles and pages.
 * @private
 */
const _initStaticDependenciesList = () =>
{
	// Get all bundle names from file system
	appBundlesNames = Files.getFolders(`${solidConstants.srcPath}*`).all(
		folder => path.basename( folder )
	);

	// Browse bundles
	appBundlesNames.map( appBundleName =>
	{
		// Get all pages for this bundle from file system
		allPagesByBundles[ appBundleName ] = Files.getFolders(`${solidConstants.srcPath}${appBundleName}/${solidConstants.pagesPath}*`).all(
			pagePath => ({
				// Page name with CapitalCamelCase
				name: CapitalizeFirst( path.basename(pagePath), true ),

				// Folder path of this page (without the file)
				path: pagePath.substr(solidConstants.srcPath.length + appBundleName.length + 1, pagePath.length)
			})
		);
	});
};


// ----------------------------------------------------------------------------- INIT CSS CONFIG

// List of all CSS Plugins
let cssPlugins;

// Generate empty CSS files pour dev mode
let generateEmptyCSSFilesForDev = false;

/**
 * Generate CSS Plugin config with a specific bundle name
 * Omit cssFileName parameter to create an embedded in JS CSS Plugin configuration
 * @param cssFileName Name of the CSS to create, without extension.
 * @private
 */
const _generateCssPluginConfig = (cssFileName) =>
{
	return (
		// No CSS file, default config
		cssFileName == null
		? CSSPlugin()

		// CSS Plugin config exporting to a CSS file
		: CSSPlugin({
			group: `${cssFileName}.css`,
			outFile: `${solidConstants.distPath}${solidConstants.bundlesPath}${cssFileName}.css`,

			// Inject CSS File from JS
			inject: (
				fuseConfig.injectCSSFilesFromJS
				? (file) => `${solidConstants.bundlesPath}${file}`
				: false
			)
		})
	);
};


/**
 * Init all CSS related plugins
 */
const _initCssConfig = () =>
{
	// Option to generate CSS Files with quantum only
	if (fuseConfig.generateCSSFiles === 'quantum')
	{
		fuseConfig.generateCSSFiles = options.quantum;
		generateEmptyCSSFilesForDev = !options.quantum;
	}

	// Enable sourceMaps if we are in CSS bundle file mode
	// Disable sourceMaps when uglifying
	const generateSourceMaps = (fuseConfig.generateCSSFiles && !options.uglify);

	// All css plugins following LESS and default CSS config
	cssPlugins = [

		// @see : http://fuse-box.org/plugins/less-plugin
		LESSPlugin({

			sourceMap: generateSourceMaps,

			// Disable IE-compat so data-uri can be huge
			ieCompat: false,

			// Enable strict math. Every math computation have to be inside parenthesis.
			// This allow to use calc() without literal operator.
			// http://lesscss.org/usage/#command-line-usage
			strictMath: true,

			// Use relative URLs so url path don't get lost
			relativeUrls: true
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
						`last ${fuseConfig.legacySupport ? 4 : 2} versions`,

						// IE and Edge support
						(fuseConfig.legacySupport ? `ie >= 11` : 'edge >= 10'),

						// iOS Support
						`iOS >= ${fuseConfig.legacySupport ? 7 : 10}`
					]
				}),

				// Clean output CSS
				require('postcss-clean')({
					// Uglify or beautify
					format: ( options.uglify ? false : 'beautify' ),
					advanced: true
				})
			],

			// PostCSS options
			{
				sourceMaps: generateSourceMaps
			}
		),

		// @see : http://fuse-box.org/plugins/css-resource-plugin
		CSSResourcePlugin({

			// Write resources to that folder
			dist: `${ solidConstants.distPath }${ solidConstants.resourcesPath }`,

			// Rewriting resources paths
			resolve: (f) => (

				// Relative from bundles to CSS Files
				fuseConfig.generateCSSFiles
				? `${solidConstants.bundleToResourcesRelativePath}${f}?${packageJson.version}`

				// But relative from base for JS injected
				: `${deployedEnvProperties.base}${solidConstants.resourcesPath}${f}?${packageJson.version}`
			),

			// Include images as Base64 into bundle
			inline: fuseConfig.inlineEveryResourcesInCSS
		})
	];

};


// ----------------------------------------------------------------------------- FUSE INIT

// Fuse config object
let fuse;

/**
 * Init fuse config
 */
const _initFuseConfig = () =>
{
	// Patch mono bundle if it's a boolean and not a string
	if (fuseConfig.monoBundle === true)
	{
		fuseConfig.monoBundle = 'bundle';
	}

	// Init FuseBox config
	fuse = FuseBox.init({

		// Sources directory
		homeDir: solidConstants.srcPath,

		// Bundles output path format
		output: `${solidConstants.distPath}${solidConstants.bundlesPath}$name.js`,

		// Typescript config file
		tsConfig: 'tsconfig.json',

		// Force typescript compiler on JS files
		useTypescriptCompiler : true,

		// Require those libs with module properties
		useJsNext: true,

		// Use experimental features like dynamic imports
		// @see : http://fuse-box.org/page/dynamic-import
		experimentalFeatures: true,

		// Output format, we support es5 if legacy mode is enabled
		target: `browser@${fuseConfig.legacySupport ? 'es5' : 'es2016'}`,

		// Use hashes only when generating web index and with uglify
		hash: ( fuseConfig.generateWebIndex && options.uglify ),

		// No source maps here, we do it on bundles
		sourceMaps: false,

		// Enable debugging from options
		log: !options.quiet,

		// True to enable fuse debug in console, slower
		debug: false,

		// @see : http://fuse-box.org/page/configuration#alias
		alias: {},

		// @see : https://fuse-box.org/page/configuration#auto-import
		autoImport : {},

		// Init plugins common to all bundles
		plugins: [

			// EnvPlugin for process.env emulation in the browser
			// @see https://fuse-box.org/page/env-plugin
			EnvPlugin({
				// Convert node env to production if we use quantum
				NODE_ENV: ( options.quantum ? 'production' : 'development' ),

				// Inject package.json version
				VERSION: packageJson.version,

				// Inject bundle path for SolidBundles
				BUNDLE_PATH : solidConstants.bundlesPath,

				// Base path from deployed env properties
				BASE : deployedEnvProperties.base
			}),

			// Generate index.html from template
			// @see https://fuse-box.org/page/web-index-plugin
			fuseConfig.generateWebIndex
			&&
			WebIndexPlugin({
				// Index template
				template: `${solidConstants.srcPath}index.html`,

				// Relative path to bundles
				path: deployedEnvProperties.base + solidConstants.bundlesPath,

				// Index file name, relative to bundle path, cheap trick
				target: '../../index.html'
			}),

			// Compress and optimize bundle with Quantum on production
			// @see : https://github.com/fuse-box/fuse-box/blob/master/docs/quantum.md
			options.quantum
			&&
			QuantumPlugin({
				// Inject Quantum API into vendors bundle
				bakeApiIntoBundle: (
					// Bake into the mono bundle if we are in mono bundle mode
					( fuseConfig.monoBundle !== false )
					? fuseConfig.monoBundle

					// Or bake into vendors
					: solidConstants.vendorsBundleName
				),

				// Enable tree-shaking capability
				treeshake: true,

				// Uglify output on production
				// Will use uglify-es on non legacy mode
				uglify: (
					options.uglify
					? {
						es6: !fuseConfig.legacySupport,
						mangle: fuseConfig.mangle,
						toplevel: fuseConfig.mangle
					}
					: false
				),

				// Generate a manifest.json file containing bundles list
				manifest: 'quantum.json',

				// Disable replace type of which breaks TweenLite and Zepto ...
				replaceTypeOf: false,

				// Promise API support for legacy browsers
				polyfills: fuseConfig.legacySupport ? ['Promise'] : [],

				// ES5 compatible in legacy mode
				ensureES5 : fuseConfig.legacySupport,

				// Remove all use strict when uglify is enabled
				removeUseStrict : options.uglify
			})
		]
	});
};


// ----------------------------------------------------------------------------- BUNDLES INIT

// List of all configured fuse bundles
let allBundles = [];

/**
 * Setup bundle plugins and code splitting
 * @param pBundle Fuse Bundle instance
 * @param pBundlePath Path of the Bundle from srcPath. * to target every bundles.
 * @param pOutputBundleName Output bundle name without extension.
 */
const _setupBundle = (pBundle, pBundlePath, pOutputBundleName) =>
{
	// Setup specific CSS output for this bundle if we are in cssOutput mode
	pBundle.plugin(
		// Catch less files from this bundle or ignore if null
		`${ pBundlePath }/**.less`,

		// All CSS plugins
		...cssPlugins,

		// Generate CSS plugin to output a file for this bundle
		_generateCssPluginConfig(
			fuseConfig.generateCSSFiles
			? pOutputBundleName
			: null
		),
	);

	// Enable source maps on dev
	pBundle.sourceMaps( !options.quantum );

	// Configure code splitting
	pBundle.splitConfig({

		// Relative path from main bundle to load code split bundles
		browser: deployedEnvProperties.base + solidConstants.bundlesPath
	});
};

/**
 * Init all bundles
 */
const _initBundlesConfig = () =>
{
	// Glog string to target included folders
	const includedFoldersGlob = `+(${ solidConstants.includedFoldersWithoutImports.join('|') })`;

	// Glob string to target all included extensions files
	const extensionsGlob = `+(${ solidConstants.includedExtensions.join('|') })`;


	/**
	 * VENDORS BUNDLE
	 */

	// Create vendor bundle if we are not in mono bundle mode
	if ( !fuseConfig.monoBundle )
	{
		allBundles.push(
			fuse.bundle( solidConstants.vendorsBundleName, `~ ${ solidConstants.entryPoint }` )
		);
	}

	/**
	 * SPLIT APP BUNDLES
	 */
	if ( fuseConfig.monoBundle === false )
	{
		// Browse all our app bundles by names
		appBundlesNames.map( currentBundleFolder =>
		{
			// Patch common output bundle name by removing the underscore
			const outputBundleName = (
				( currentBundleFolder === solidConstants.commonBundleName )
				? solidConstants.commonOutputFileName
				: currentBundleFolder
			);

			// Create this new bundle and add it to the bundle list
			let bundle = fuse.bundle( outputBundleName );
			allBundles.push( bundle );

			// Create a new set of instructions for this bundle
			let instructions = [];

			// Setup bundle plugins and code splitting
			_setupBundle( bundle, currentBundleFolder, outputBundleName );

			// Add auto-started entry point and remove vendors dependencies
			instructions.push(`!> [${ solidConstants.entryPoint }]`);

			// In mono or multi bundle mode
			// Add included path
			instructions.push(`+ [${ currentBundleFolder }/${ includedFoldersGlob }/**/*.${ extensionsGlob }]`);

			// Browse other bundles to remove their files from this bundle
			appBundlesNames.map( otherAppBundleName =>
			{
				// Remove other app bundles dependencies
				// so shared files are only included into their own bundle
				if (otherAppBundleName !== currentBundleFolder)
				{
					instructions.push(`- [${ otherAppBundleName }/**/*.${ extensionsGlob }]`);
				}
			});

			// Set instructions to the current bundle
			bundle.instructions( instructions.join("\n") );
		});

	}

	/**
	 * MONO APP BUNDLES
	 */
	else
	{
		// Create the mono bundle and add it to the list
		const bundle = fuse.bundle( fuseConfig.monoBundle )
		allBundles.push( bundle );

		// Setup bundle plugins and code splitting
		_setupBundle( bundle, '*', fuseConfig.monoBundle );

		// Set bundle instructions
		bundle.instructions([

			// Add auto-started entry point with all vendors dependencies
			`> ${ solidConstants.entryPoint }`,

			// Add included path from every bundles and include vendor dependencies
			`+ */${ includedFoldersGlob }/*/*.${ extensionsGlob }`

		].join("\n"))
	}


	/**
	 * WATCH AND DEV MODE
	 */

	// If we are in dev mode and if watch mode is allowed
	if ( !options.quantum && !options.noWatch )
	{
		// Enable embedded server for HMR reloading
		fuse.dev({
			port: options.port,
			httpServer: fuseConfig.useEmbeddedDevServer,
			root: solidConstants.distPath
		});

		// Browse all bundles
		allBundles.map( bundle =>
		{
			// Watch this bundle
			bundle.watch();

			// Do not HMR vendor bundle otherwise TypeChecking will dispatch 2 page reload
			if ( bundle.name === solidConstants.vendorsBundleName ) return;

			// Launch HMR and watch
			bundle.hmr({
				port: options.port,
				reload: options.reload
			});
		});
	}
};


// ----------------------------------------------------------------------------- TYPE AND LESS CHECKERS INIT

// Solid checker instance
let solidCheck;

/**
 * Init checkers
 * @private
 */
const _initCheckers = () =>
{
	// Only require solid checker if we will check Typescript or Less
	if ( !options.noLessCheck || !options.noTypeCheck)
	{
		// Require solid checker
		solidCheck = require('./task-check');

		// Init with solid config and verbosity
		solidCheck.init( !options.quiet );
	}

	// Show message if Typescript checking is disabled
	if ( options.noTypeCheck )
	{
		options.quiet || console.log(`\n  → Warning, Typescript checking disabled.\n`.red.bold);
	}

	// Enable Typescript checker on each bundles if we are in dev mode
	else if ( !options.quantum )
	{
		// Setup Typescript checker on current bundles
		solidCheck.typescript(

			// Exit on error when quantum is enabled
			options.quantum,

			// Pass all configured bundles
			allBundles
		);
	}

	// If we are in production mode but user disabled less check
	if ( options.lessCheck && options.noLessCheck )
	{
		options.noTypeCheck || options.quiet || console.log('');
		options.quiet || console.log(`  → Warning, Less checking disabled.\n`.red.bold);
	}
};


// ----------------------------------------------------------------------------- PRE BUILD

/**
 * Pre build static dependencies and atoms.
 */
const _preBuild = () =>
{
	// Load pre-builder
	const solidPreBuild = require('./task-prebuild');

	// Init with solid and fuse configs
	solidPreBuild.init( fuseConfig );

	// Pre-build all pages and bundles to create a static dependencies tree
	solidPreBuild.preBuildStaticDependencies( appBundlesNames, allPagesByBundles );

	// Pre-build atoms typescript file
	solidPreBuild.preBuildAtoms();
};


// ----------------------------------------------------------------------------- DEPLOY

// Get deployed properties
let deployedEnvProperties;

/**
 * Init deploy properties and deploy.
 * Will ask user to select an env and stop process if this is not alread done.
 */
const _initDeployerAndDeploy = () =>
{
	// Init solid deployer
	const solidDeploy = require('./task-deploy');

	// Get properties
	deployedEnvProperties = solidDeploy.getPropertiesFromCurrentEnv();

	// Deploy and stop if there is an issue
	solidDeploy.deploy();
};


// ----------------------------------------------------------------------------- PUBLIC SCOPE

/**
 * Public API
 */
module.exports = {

	/**
	 * Init Fuse bundler
	 * @param pOptionsOverride Override CLI options with these parameters
	 */
	init: (pOptionsOverride) =>
	{
		// Disable files verbose
		Files.setVerbose( false );

		// Init CLI Options
		_initCLIOptions( pOptionsOverride );

		// Init deploy properties and deploy
		_initDeployerAndDeploy();

		// Get bundles and pages list
		_initStaticDependenciesList();

		// Init CSS Pipe first
		// It's used by Fuse and Bundle configs
		_initCssConfig();

		// Init Fuse config
		_initFuseConfig();

		// Init Bundles config
		_initBundlesConfig();

		// Init typescript and less checkers now we have bundles
		_initCheckers();
	},


	/**
	 * Run Fuse bundler
	 */
	run: () => new Promise( async resolve =>
	{
		// Wait a bit so Fuse has time to show console init
		await new Promise(res => setTimeout(res, 30));

		// ---- PRE BUILD PHASE
		options.quiet || console.log(`\nPre-building static dependencies, atoms and deploy files.`.yellow);

		// Start pre-build phase
		_preBuild();


		// ---- CHECK PHASE

		// Check less files if asked and exit if we have any error
		if ( options.lessCheck && !options.noLessCheck )
		{
			await solidCheck.less( true );
		}

		// Check Typescript files and exit on error if quantum is enabled
		// So Typescript will be before actual compilation
		if ( !options.noTypeCheck && options.quantum )
		{
			// Setup Typescript checker on current bundles
			solidCheck.typescript( true );
		}


		// ---- CLEAN PHASE
		options.quiet || console.log(`Cleaning old bundles.`.yellow);

		// Remove every previously compiled bundles
		Files.getFolders(`${solidConstants.distPath}${solidConstants.bundlesPath}`).delete();

		// If we are in dev mode and generating a vendors bundle
		if ( !options.quantum && fuseConfig.monoBundle === false)
		{
			// Write fake vendors map so browser stops annoying us with this.
			Files.new(`${solidConstants.distPath}${solidConstants.bundlesPath}${solidConstants.vendorsBundleName}.js.map`)
			.write(`{"version":0,"sources":[],"mappings":[]}`);
		}

		// ---- RUN PHASE
		options.quiet || console.log(`Starting Fuse.\n`.yellow);

		// Run fuse, run !
		await fuse.run();

		// If we are in dev mode and we do not have CSS files built because of it
		// We generate empty CSS Files so markup isn't lost about CSS files in dev mode
		if ( generateEmptyCSSFilesForDev )
		{
			// Create an empty CSS file for each bundle, but vendor
			allBundles.map( bundle =>
			{
				if (bundle.name === solidConstants.vendorsBundleName) return;
				Files.new(`${solidConstants.distPath}${solidConstants.bundlesPath}${bundle.name}.css`).write('');
			});
		}

		// If we generate CSS and are in uglify mode
		if ( fuseConfig.generateCSSFiles && options.quantum && options.uglify )
		{
			// Remove CSS maps
			Files.getFiles(`${solidConstants.distPath}${solidConstants.bundlesPath}*.css.map`).remove();

			// And remove all comments from CSS
			Files.getFiles(`${solidConstants.distPath}${solidConstants.bundlesPath}*.css`).all(
				file => Files.getFiles( file ).alter(
					content => content.replace(/(\/\*.*\*\/)/gmi, '')
				)
			);
		}

		// All good
		resolve();
	}),

	/**
	 * Start Fuse bundling with dev mode.
	 */
	dev: async () =>
	{
		// Init and run
		module.exports.init();
		await module.exports.run();
	},

	/**
	 * Start Fuse bundling with production mode.
	 */
	production: async () =>
	{
		// Init with prod overrides
		module.exports.init({
			// Enable quantum and uglify in production
			quantum : true,
			uglify : true,

			// Also, we check all less files, but we allow user to override this
			lessCheck: true
		});

		// Run
		await module.exports.run();
	},
};