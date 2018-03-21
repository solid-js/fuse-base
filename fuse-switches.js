

// ----------------------------------------------------------------------------- PATHS AND CONSTANTS

// Source folder
exports.srcPath = 'src/';

// Output directory
exports.distPath = 'dist/';

// Bundle path from dist path
exports.bundlesPath = 'assets/bundles/';

// Compiled resources folder (inside dist)
exports.resourcesPath = 'assets/resources/';

// Default apps entry point
exports.entryPoint = 'index.ts';

// Async bundle folders (inside src)
exports.asyncPath = 'async/';

// Path to sprites folder from src
exports.spritesPath = 'sprites/';

// Vendors bundle name
exports.vendorsBundleName = 'vendors';

// Common bundle name in src
exports.commonBundleName = '_common';

// Common js bundle file name
exports.commonFileName = 'common';

// Deployed config path inside common bundle
exports.deployedConfigPath = 'data/config.ts';

// Atoms folder path into common bundle
exports.atomsPath = 'atoms/';

// Atoms typescript file path inside common bundle
exports.atomsTypescriptFile = 'atoms.ts';


// ----------------------------------------------------------------------------- CONFIG

/**
 * Set a name if you want to create only one bundle.
 * Each app bundle will be in this bundle.
 * Code splitting will still work in Quantum mode.
 * Set to false if you want to split each app bundle into a different compiled JS bundle.
 */
exports.monoBundle = false; //'bundle';

/**
 * Allow uglify to change var names in production.
 * Mangle will help to have smaller bundles but can break things so use carefully !
 */
exports.mangle = false;

/**
 * Generate an index.html from template.
 * If false, and quantum is enabled, will generate a quantum.json manifest file.
 * If enabled, dist/index.html will be removed when cleaning.
 */
exports.generateWebIndex = true;

/**
 * Use NodeJS express server and launch on dev.
 */
exports.useEmbeddedServer = false;

/**
 * Support old browsers like IE 11 or iOS 7
 */
exports.legacySupport = true;

/**
 * Folders to include in every bundles, even if they are not implicitly imported.
 * Useful for async import.
 */
exports.includedFoldersWithoutImports = ['molecules', 'components', 'pages'];

/**
 * Default included extensions for not implicit imports.
 */
exports.extensions = ['ts', 'tsx', 'less'];

/**
 * Set to false to include all CSS files as JS bundles.
 * Allows HMR and code splitting for CSS.
 * Set to a 'filename.css' to generate a unique css bundle including every css instructions.
 */
exports.cssBundleFile = false; // `${exports.bundlesPath}styles.css`;

/**
 * Shimmed libs like jQuery.
 * Added removeForQuantum option to remove this shim when quantum compiling.
 * @see : http://fuse-box.org/page/configuration#shimming
 */
exports.vendorShims = {
	/*
	zepto: {
		source: "node_modules/zepto/dist/zepto.js",
		exports: "$",

		// Special case : Zepto and jQuery does not work with quantum and shimming
		removeForQuantum: true
	}
	*/
};
