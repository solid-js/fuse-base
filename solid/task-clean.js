// Load Sparky tasks
const Sparky = require('fuse-box/sparky');

// Get Files helper for easy Files/Folder manipulating
const { Files } = require('@zouloux/files');

// Load solid constants and fuse config
const solidConstants = require('../solid-constants.config');
const fuseConfig = require('../solid-fuse.config');

module.exports = {

	/**
	 * Remove all FuseBox caches and clean output directories.
	 */
	clean: () =>
	{
		console.log('  → Cleaning ...'.cyan);

		// Clear cache before each command
		Files.getFolders('.fusebox').delete();

		// Remove every compiled bundles
		Files.getFolders(`${ solidConstants.distPath }${ solidConstants.bundlesPath }*.(js|css|map)`).delete();

		// Remove compiled html if we have one
		fuseConfig.generateWebIndex
		&&
		Files.getFiles(`${ solidConstants.distPath }index.html`).delete();

		// Remove resources
		// Remove this line if there are other files into resource folder
		Files.getFolders(`${ solidConstants.distPath }${ solidConstants.resourcesPath }`).delete();

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
	 * Tries to patches common problems.
	 */
	noProblemo: async () =>
	{
		// Intro message
		console.log(`\n  → No problemo amigo !  \n`.inverse.bold.italic);

		// Reinstall node_modules with full-blast method
		console.log('  → Reinstalling node modules ...'.cyan);
		let npmUpdate = require('child_process').spawnSync('npm', ['run', 'please']);
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