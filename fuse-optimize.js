const switches = require('./fuse-switches');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

module.exports = {

	/**
	 * Optimize generated resources
	 */
	optimize: () => new Promise( (resolve) =>
	{
		console.log(`Optimizing fuse images resources...`.yellow);

		// @see : https://github.com/imagemin/imagemin
		imagemin(
			// Input are fuse generated resources
			[`${ switches.distPath }${ switches.resourcesPath }*.{jpg,png}`],

			// Same output, we override fuse resources
			`${ switches.distPath }${ switches.resourcesPath }`,
			{
				plugins: [
					// @see : https://github.com/imagemin/imagemin-jpegtran
					imageminJpegtran(),

					// @see : https://github.com/imagemin/imagemin-pngquant
					// TODO : Make a config file
					imageminPngquant({
						// Output quality
						quality: '30-60',

						// Dithering level
						floyd: .5,

						// True to disable dithering
						nofs: true,

						// Reduce number of color depth bits (from 0 to 4)
						posterize: 0,

						// Speed trade-off (1: no speed opt, 10: Max speed but lower quality)
						speed: 3
					})
				]
			}
		)

		// Finished
		.then( files =>
		{
			// Show files
			files.map( file =>
			{
				console.log(`Optimized image : ${file.path}`.grey);
			});

			// End task
			console.log(`Done !`.green);
			resolve();
		});
	})

}
