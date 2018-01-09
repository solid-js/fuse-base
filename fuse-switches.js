

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

// Vendors bundle name
exports.vendorsBundleName = 'vendors';


// ----------------------------------------------------------------------------- CONFIG

/**
 * Generate an index.html from template.
 * If false, and quantum is enabled, will generate a quantum.json manifest file.
 * If enabled, dist/index.html will be removed when cleaning.
 */
exports.generateWebIndex = true;

/**
 * Support old browsers like IE 11 or iOS 7
 */
exports.legacySupport = true;

/**
 * Folders to include in every bundles, even if they are not implicitly imported.
 * Useful for async import.
 */
exports.includedFoldersWithoutImports = ['elements', 'components', 'pages'];

/**
 * Default included extensions for not implicit imports.
 */
exports.extensions = ['ts', 'tsx', 'less'];

/**
 * Set to false to include all CSS files as JS bundles.
 * Allows HMR and code splitting for CSS.
 * Set to a 'filename.css' to generate a unique css bundle including every css instructions.
 */
exports.cssBundleFile = false; // `${bundlesPath}styles.css`;

/**
 * Shimmed libs like jQuery
 * @see : http://fuse-box.org/page/configuration#shimming
 */
exports.vendorShims = {};