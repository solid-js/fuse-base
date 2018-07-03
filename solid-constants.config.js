
/**
 * This file stores all paths and constants used throughout all Solid files.
 * The best is to not touch it to keep this structure
 * and keep in "convention over configuration" state of mind.
 * If needed you can still teak some options here, be careful ! :)
 */

/**
 * NOTE : Every folder path needs to end with a trailing slash.
 */

// Source folder
exports.srcPath = 'src/';

// Output directory
exports.distPath = 'dist/';

// Bundle path from dist path
exports.bundlesPath = 'assets/bundles/';

// Compiled resources folder from dist path
exports.resourcesPath = 'assets/resources/';

// Resources folder relative to bundle folder
// Used when exporting CSS Files, url() target is relative to CSS file
exports.bundleToResourcesRelativePath = '../resources/';

// Pages folders path within bundles.
exports.pagesPath = ['pages/', 'popins/'];

// Path to sprites folder from src
exports.spritesPath = 'sprites/';

// Path to skeletons
exports.skeletonsPath = 'solid/skeletons/';

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

// Default apps entry point
exports.entryPoint = 'index.ts';

// Vendors bundle name
exports.vendorsBundleName = 'vendors';

// Common bundle name in src
exports.commonBundleName = '_common';

// Common JS bundle output file name
exports.commonOutputFileName = 'common';

// Files types to import as string
exports.filesToImportAsStrings = ['*.fs', '*.vs', '*.txt'];

// Folders to include in every bundles, even if they are not implicitly imported.
exports.includedFoldersWithoutImports = ['molecules', 'components', 'pages', 'popins', 'models'];

// List of all component compatible folders, for scaffolder only
exports.componentCompatibleFolders = ['molecules', 'components'];

// Files extensions to include within included folders.
exports.includedExtensions = ['ts', 'tsx', 'less'];

// Folders to scaffold in app bundles
exports.appBundleFoldersToScaffold = ['molecules', 'pages', 'popins', 'components', 'models', 'data', 'sprites'];