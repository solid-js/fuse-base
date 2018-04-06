
/**
 * This file stores all paths and constants used throughout all Solid files.
 * The best is to not touch it to keep this structure
 * and keep in "convention over configuration" state of mind.
 * If needed you can still teak some options here, be careful ! :)
 */

// TODO : Clean un peu ça

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

// Path to the selected env file
exports.envPath = 'properties/.envName';

// Path to the properties folder
exports.propertiesPath = 'properties/';

// Deployed config path inside common bundle
exports.deployedConfigPath = 'data/config.ts';

// Atoms folder path into common bundle
exports.atomsPath = 'atoms/';

// Atoms typescript file path inside common bundle
exports.atomsTypescriptFile = 'atoms.ts';

// Folders to include in every bundles, even if they are not implicitly imported.
exports.includedFoldersWithoutImports = ['molecules', 'pages'];

// List of all component compatible folders, for scafolder only
exports.componentCompatibleFolders = ['molecules', 'components'];

// Files extensions to include within included folders.
exports.includedExtensions = ['ts', 'tsx', 'less'];

// Pages folder path within bundles.
// Used to generate static tree of pages and allow dynamic import with quantum.
exports.pagesPath = 'pages/';

// Path to skeletons
exports.skeletonsPath = 'solid/skeletons/';

// Folders to scaffold in app bundles
exports.appBundleFoldersToScaffold = ['molecules', 'pages', 'components', 'models', 'data', 'sprites'];
