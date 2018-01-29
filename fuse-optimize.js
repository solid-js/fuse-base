const { Files } = require('./helpers/files');
const switches = require('./fuse-switches');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');


// Mini match targeting images inside a folder
const imagesMiniMatch = '*.{jpg,png}';

// Default PNG optimizing config
const defaultConfig = {

	// Output quality
	quality: '40-80',

	// Dithering level
	//floyd: .5,

	// True to disable dithering
	//nofs: true,

	// Reduce number of color depth bits (from 0 to 4)
	//posterize: 0,

	// Speed trade-off (1: no speed opt, 10: Max speed but lower quality)
	//speed: 3
};


module.exports = {

	/**
	 * Optimize files with imagemin.
	 * @param pInputFiles Array of minimatch files
	 * @param pOutputFolder Output folder for every input files
	 * @param pPngConfig Png config overriding default config
	 * @param pAddDotMinAndDoNotOverride Do not override image and add .min extension before real file extension.
	 * @return {Promise<any>}
	 */
	optimizeFiles : (pInputFiles, pOutputFolder, pPngConfig, pAddDotMinAndDoNotOverride) => new Promise( (resolve) =>
	{
		// Clone default config and override with custom config
		const pngConfig = { ... defaultConfig, ... pPngConfig };

		// If we need to add .min extension, output in a temp folder
		let tempOutput = (
			pAddDotMinAndDoNotOverride
			? `temp-${Date.now()}/`
			: pOutputFolder
		);


		// @see : https://github.com/imagemin/imagemin
		imagemin(
			// Input
			pInputFiles,

			// Output
			`${ tempOutput }`,
			{
				plugins: [
					// @see : https://github.com/imagemin/imagemin-jpegtran
					imageminJpegtran(),

					// @see : https://github.com/imagemin/imagemin-pngquant
					imageminPngquant( pngConfig )
				]
			}
		)

		// Finished
		.then( files =>
		{
			// Disable files logs
			Files.setVerbose(false);

			// If we need to add min extension
			if (pAddDotMinAndDoNotOverride)
			{
				// Browse images inside temp folder
				Files.getFiles(`${tempOutput}${imagesMiniMatch}`).all( file =>
				{
					// Read file extension
					const ext = path.extname( file );

					// New file name with .min extension before original file extension
					const newFileName = `${ path.basename( file, ext ) }.min${ ext }`;

					// Path of the minified image, in the same folder
					const minifiedImagePath = path.join( pOutputFolder, newFileName);

					// Delete previously minified image
					Files.getFiles( minifiedImagePath ).delete();

					// Move file inside the same folder
					Files.getFiles( file ).moveTo( minifiedImagePath );
				});

				// Remove temp folder
				Files.getFolders( tempOutput ).delete();
			}

			// Enable files logs back
			Files.setVerbose(true);

			// Show files
			files.map( file =>
			{
				console.log(`Image ${ path.basename(file.path) } optimized.`.grey);
			});

			// Done
			resolve();
		});
	}),

	/**
	 * Optimize every images inside src folder and create .min versions with imagemin.
	 * Sprites images will not be optimized because node fuse sprites handles it.
	 * @return {Promise<any[]>}
	 */
	optimize: () =>
	{
		// Browse every images that are not inside a sprite folder
		const promises = Files.getFiles(
			`${ switches.srcPath }*/!(${ path.basename( switches.spritesPath ) })/**/${ imagesMiniMatch }`
		).all( imageFile =>
		{
			// Skip already minified images
			const imageBaseName = path.basename( imageFile, path.extname(imageFile) );
			if ( imageBaseName.lastIndexOf('.min') === (imageBaseName.length - 4) ) return;

			// Optimize this file and get its promise
			return module.exports.optimizeFiles(
				[imageFile],
				path.dirname(imageFile),
				// TODO : PNG CONFIG FILE
				{},
				// Add .min extension
				true
			)
		});

		// Return all promises
		return Promise.all( promises );
	},
}
