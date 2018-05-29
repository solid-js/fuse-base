// Load Sparky tasks
const Sparky = require('fuse-box/sparky');

// Get Files helper for easy Files/Folder manipulating
const { Files } = require('@zouloux/files');

// Load solid constants and fuse config
const solidConstants = require('../solid-constants.config');
const fuseConfig = require('../solid-fuse.config');

module.exports = {

	/**
	 * Clean all caches
	 */
	cleanCaches: () =>
	{
		// Clear cache before each command
		Files.getFolders('.fusebox').delete();
	},

	/**
	 * Clean compiled bundles and maps
	 */
	cleanBundles: () =>
	{
		// If there is no bundle folder
		if (solidConstants.bundlesPath == '')
		{
			// Then remove only generated bundles securely
			Files.getFiles(`${ solidConstants.distPath }${ solidConstants.bundlesPath }*.@(js|map|css)`).delete();

			// Also remove css-sourcemap which can appear dependeing on config
			Files.getFolders(`${ solidConstants.distPath }${ solidConstants.bundlesPath }css-sourcemaps/`).delete();
		}

		// Otherwise we can wipe the entire folder
		else Files.getFolders(`${ solidConstants.distPath }${ solidConstants.bundlesPath }`).delete();
	},

	/**
	 * Clean compiled resources
	 */
	cleanResources: () =>
	{
		// If there is no resource folder
		( solidConstants.resourcesPath == '' )

		// Then remove only generated resources securely
		? Files.getFiles(`${ solidConstants.distPath }${ solidConstants.resourcesPath }*.@(woff|woff|eot|ttf|png|jpg|gif)`).delete()

		// Otherwise we can wipe the entire folder
		: Files.getFolders(`${ solidConstants.distPath }${ solidConstants.resourcesPath }`).delete()
	},

	/**
	 * Clean web index if fuse is configured to create an index file
	 */
	cleanWebIndex: () =>
	{
		// Remove compiled html if we have one
		fuseConfig.generateWebIndex
		&&
		Files.getFiles(`${ solidConstants.distPath }index.html`).delete();
	},

	/**
	 * Remove all FuseBox caches and clean output directories.
	 */
	clean: () =>
	{
		console.log('  → Cleaning ...'.cyan);

		module.exports.cleanCaches();
		module.exports.cleanBundles();
		module.exports.cleanResources();
		module.exports.cleanWebIndex();

		console.log('  → Done !'.green);
	},


	/**
	 * Clean generated sprites
	 */
	cleanSprites: () =>
	{
		console.log('  → Cleaning sprites ...'.cyan);

		// Remove generated LESS / Typescript and PNG
		Files.getFiles(`${ solidConstants.srcPath }*/${ solidConstants.spritesPath }*.+(less|ts|png)`).delete();

		console.log('  → Done !'.green);
	},

	/**
	 * Updates NPM modules
	 * Clean Fuse cache
	 * Clean and re-generate sprites
	 * Start dev mode
	 *
	 * Useful after `git pull`
	 *
	 * @return {Promise<void>}
	 */
	afterPull: async () =>
	{
		// Reinstall node_modules with full-blast method
		console.log('  → Updating node modules ...'.cyan);
		let npmUpdate = require('child_process').spawnSync('npm', ['up']);
		console.log(
			(npmUpdate.stderr || '').toString()
			||
			(npmUpdate.stdout || '').toString()
		);
		console.log('  → Done !\n'.green);

		// Clean everything
		await Sparky.exec('clean');
		await Sparky.exec('cleanSprites');

		// Re-generate sprites
		await Sparky.exec('sprites');

		// Tries dev mode
		console.log('  → Retrying dev mode ...'.cyan);
		await Sparky.exec('dev');
	},

	/**
	 * Tries to patches common problems.
	 */
	noProblemo: async () =>
	{
		// Intro message
		console.log(`\n  → No problemo amigo !  \n`.inverse.bold.italic);

		// Reinstall node_modules with full-blast method
		console.log('  → Reinstalling node modules ...'.cyan);
		let npmUpdate = require('child_process').spawnSync('npm', ['run', 'reset']);
		console.log(
			(npmUpdate.stderr || '').toString()
			||
			(npmUpdate.stdout || '').toString()
		);
		console.log('  → Done !\n'.green);

		// Clean everything
		await Sparky.exec('clean');
		await Sparky.exec('cleanSprites');

		// Re-generate sprites
		await Sparky.exec('sprites');

		// Check Less and Typescript files
		await Sparky.exec('lessCheck');
		await Sparky.exec('typeCheck');

		// Tries dev mode
		console.log('  → Retrying dev mode ...'.cyan);
		await Sparky.exec('dev');
	}
}