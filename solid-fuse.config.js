
/**
 * Set a name if you want to create only one bundle.
 * Each app bundle will be in this bundle.
 * No vendors bundle will be created.
 * Code splitting will still work in Quantum mode.
 *
 * Set to false if you want to split each app bundle into a different compiled JS bundle.
 */
exports.monoBundle = 'bundle';

/**
 * Set to false to include all CSS files in JS bundles.
 *
 * Set to true to generate one CSS bundle next to each js bundle.
 *
 * Set to 'quantum' to enable only in quantum mode.
 */
exports.generateCSSFiles = false; // true; // 'quantum';

/**
 * Set to true if you want your generated CSS Files auto-imported at startup from JS bundles.
 * Otherwise, you will have to import them manually from HTML markup, which is recommended.
 *
 * Set to false if you don't generate CSS Files.
 *
 * Set to 'quantum' to enable only in quantum mode.
 * @type {boolean}
 */
exports.injectCSSFilesFromJS = false; // true; // 'quantum';

/**
 * Will force every resource to be inline in Base64.
 * Only for testing purpose, do not use it in production !
 * Please use Less data-uri instead if needed @see http://lesscss.org/functions/#misc-functions-data-uri
 */
exports.inlineEveryResourcesInCSS = false;

/**
 * Allows Uglify to change var names in production.
 * Mangle will help to have smaller bundles but can break things so use carefully !
 */
exports.mangle = false;

/**
 * Support old browsers like IE 11 or iOS 7 by keeping ES5 syntax and polyfills.
 */
exports.legacySupport = true;

/**
 * Generate an index.html from template.
 * If false, and quantum is enabled, will generate a quantum.json manifest file.
 * If enabled, dist/index.html will be removed when cleaning.
 */
exports.generateWebIndex = true;

/**
 * Use NodeJS express server on dev.
 * Server port can be overridden with CLI option --port.
 */
exports.useEmbeddedDevServer = true;

/**
 * Import pages as static dependencies, with a require statement in place of an import.
 *
 * require() will include the page and its dependencies to its parent bundle.
 * import() will trigger a code split and create a new file, containing the page and its dependencies.
 *
 * Note : Code splitting only work in quantum mode. In dev everything will be in its parent bundle.
 *
 * Set to false to use import()
 * Set to true to use require()
 * Set to an array of page names to use require on those page and import on others.
 */
exports.syncPagesImporters = false; // true; // ['HomePage'];