
const path = require('path');
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

// ----------------------------------------------------------------------------- TODO ZONE

/**
 * TODO :
 * - Tout tester !
 * - Refacto du framework avec nouvelle API
 * - Fuse-tools
 * - Deployer
 * - Sprite generator
 * - SVG plugin ?
 * - Voir alias : https://github.com/fuse-box/fuse-box/issues/803
 *
 * BETTER :
 * - Test inferno à la place de react
 * - If possible : assets folder, this is cleaner !
 * - Bundles CSS en option pour éviter le full JS
 *
 * DONE : Task dev + task production
 * DONE : Sparky
 * DONE : Code splitting CSS
 * DONE : Code splitting JS
 */


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


// ----------------------------------------------------------------------------- PATHS

// Output directory
const dist = 'dist/';

// TODO
//const assets = 'dist/assets/';

// Source folder
const src = 'src/';

// Default apps entry point
const entryPoint = 'Main.tsx';

// Async bundle folders (inside src)
const async = 'async/';


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

		alias: {
			//'solidify' : 'solidify-lib'
		},

		plugins: [
			// Styling config
			[
				// @see : http://fuse-box.org/plugins/less-plugin
				LESSPlugin({
					// FIXME : Not working now... See also PostCSS sourceMap config if enabled.
					//sourceMap: true,
					paths: [
						// FIXME : Trouver une solution pour l'autocomplete PHPStorm
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
						// TODO : CLEAN REBASE
						rebaseTo: '/test',

						// Keeps breaks on uglify mode and beautify otherwise
						format: ( options.uglify ? 'keep-breaks' : 'beautify' ),
						advanced: true
					})
				]),

				// @see : http://fuse-box.org/plugins/css-resource-plugin
				CSSResourcePlugin({

					// Write resources to that folder
					dist: `${dist}assets/`,

					// FIXME : A tester
					// Include images as Base64 into bundle
					//inline: true

					// Rewriting resources paths
					//resolve: (f) => `/resources/${f}`
				}),

				// @see : http://fuse-box.org/plugins/css-plugin
				CSSPlugin({
					// Export a CSS file and do not inject CSS into JS bundles
					group: 'bundle.css',
					outFile: `${dist}bundle.css`
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
				template: 'src/index.html',
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
				bakeApiIntoBundle: 'vendors',

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
		fuse.bundle('vendors').instructions(` ~ ${entryPoint} `)
	);


	/**
	 * MAIN APP BUNDLE
	 */

	// Init main app bundle and add it to app bundles
	const mainApp = fuse.bundle('mainApp');
	appBundles.push(mainApp);

	// Get async bundles entry points to automate code splitting.
	let asyncBundles = require('glob').sync( `${src}${async}*/*.tsx` ).map( (file) =>
	{
		// Split file path components
		let filePath = file.split('/');

		// Return bundle name and bundle entry point
		return [
			// Bundle name (starting with lowerCase)
			filePath[ filePath.length - 2 ],

			// Bundle entry point (starting with UpperCase and with ts(x) extension)
			filePath[ filePath.length - 1 ]
		];
	});

	// Setup code splitting from async bundles
	asyncBundles.map( (asyncEntry) =>
	{
		// FIXME : Clean + more comment
		// .split('async/customerArea/**', 'customerArea > async/customerArea/CustomerArea.tsx')
		mainApp.split(

			// Match every file inside bundle directory
			`${async}${asyncEntry[0]}/**`,

			// Name of the bundle > Entry point of the bundle
			`${asyncEntry[0]} > ${async}${asyncEntry[0]}/${asyncEntry[1]}`
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
			app
				.hmr({reload: options.reload})
				.watch()
				.sourceMaps(true)
		});
	}
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
		reload: false
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
		}
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
 * Load configs and run fuse !
 * Will read options from CLI.
 */
Sparky.task('run', ['config:options', 'config:fuse', 'config:bundles'], () =>
{
	fuse.run();
});

/**
 * Load configs and run fuse !
 * Will force options for production.
 */
Sparky.task('production', ['config:production', 'config:fuse', 'config:bundles'], () =>
{
	fuse.run();
});