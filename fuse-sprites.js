const { Files } = require('./helpers/files');
const switches = require('./fuse-switches');
const path = require('path');
const nsg = require('node-sprite-generator');
const Handlebars = require('handlebars');


// ----------------------------------------------------------------------------- CONFIG

// Sprite namming
const outputSpriteExtension     = '.png';
const spritePrefix              = 'sprite';
const separator                 = '-';

// Default sprite config
const defaultSpriteConfig = {
	layout: 'packed',
	pixelRatio: 1,
	layoutOptions: {
		padding: 2,
		scaling: 1
	},
	compositorOptions: {
		compressionLevel	: 6,
		filter          	: 'none'
	}
};


module.exports = new Promise( (resolve) =>
{
	// ------------------------------------------------------------------------- PREPARE

	// Get skeletons
	let skeletons = [

		// LESS Template
		{
			extension: 'less',
			template: Handlebars.compile(
				Files.getFiles(`skeletons/sprites/spriteTemplateLess`).read()
			)
		},

		// JSON Template
		{
			extension: 'json',
			template: Handlebars.compile(
				Files.getFiles(`skeletons/sprites/spriteTemplateJson`).read()
			)
		},
	];


	// Generate sprite seed for cache busting
	const spriteSeed = (
		(Math.random() * Math.pow(10, 16)).toString(16)
		+ new Date().getTime().toString(16)
	);


	// ------------------------------------------------------------------------- GENERATE STYLE SHEET

	// Function called to generate a stylesheet
	const generateStylesheets = (pSpriteName, pSpriteData, pStylesheetOutputPath, pPNGOutputPath, pStylesheetOptions, pCallback) =>
	{
		// Create clean styleSheet data for handlebars skeletons
		const cleanStylesheetData = {
			spriteName    : pSpriteName,
			spritePrefix  : pStylesheetOptions.prefix,
			spriteSeed    : spriteSeed,
			spriteWidth   : pSpriteData.width,
			spriteHeight  : pSpriteData.height,
			spritePath    : pStylesheetOptions.spritePath,
			textures      : []
		};

		// Browse images
		for (let i in pSpriteData.images)
		{
			// Target this image data
			let currentImage = pSpriteData.images[i];

			// Add clean data to clean styleSheet data
			cleanStylesheetData.textures.push({
				x       : currentImage.x,
				y       : currentImage.y,
				width   : currentImage.width,
				height  : currentImage.height,
				name    : path.basename( currentImage.path, path.extname( currentImage.path ) )
			});
		}

		// Add lastOne flag for JSON files
		cleanStylesheetData.textures[cleanStylesheetData.textures.length - 1].lastOne = true;

		// Browse already loaded skeletons
		for (let i in skeletons)
		{
			// Generate styleSheet from skeleton and write it to output file
			let currentSkeleton = skeletons[i];
			Files.new(`${pStylesheetOutputPath}.${currentSkeleton.extension}`).write(
				currentSkeleton.template( cleanStylesheetData )
			);
		}

		// We are all set
		pCallback();
	}


	// ------------------------------------------------------------------------- GENERATE SPRITE

	let totalSprites = 0;

	// Browser sprites folders
	Files.getFolders(`${ switches.srcPath }${ switches.commonBundleName }/${ switches.spritesFolder }*/`).all( folder =>
	{
		console.log(`Generating sprite ${folder} ...`.grey);

		++totalSprites;

		// Read sprite config
		let spriteConfig;
		try
		{
			spriteConfig = require(`./${ path.join(folder, '_sprite-config2.js') }`);
		}

		// Default sprite config
		catch (error)
		{
			spriteConfig = defaultSpriteConfig;
		}

		// Get images list
		const images = Files.getFiles( path.join(folder, '*.+(jpg|jpeg|png|gif)') ).files;

		// Get sprite name from folder name
		const spriteName = path.basename( folder );

		// Compute nsg options
		const nsgOptions = {

			// List of all images to include
			src: images,

			// Compiled PNG sprite file path
			spritePath: `${switches.distPath}${switches.spritesPath}${spriteName}.png`,

			// Compiled stylesheet path, without extension
			stylesheetPath: `${switches.srcPath}${switches.spritesFolder}${spritePrefix}${separator}${spriteName}`,

			// Stylesheet options
			stylesheetOptions: {
				// Prefix for each image
				prefix		: `${spritePrefix}${separator}${spriteName}`,

				// Relative path from web page to get PNG file
				spritePath  : `${switches.relativeSpritePath}${spriteName}${outputSpriteExtension}`,

				// Pixel ratio from sprite config
				pixelRatio  : spriteConfig.pixelRatio
			},

			// Layout config from config file
			layout: spriteConfig.layout,

			// Layout options from config file
			layoutOptions: spriteConfig.layoutOptions,

			// Use pure node compositor
			compositor: 'jimp',

			// Compositor options from config file
			compositorOptions: spriteConfig.compositorOptions,

			// Method to generate sprite sheet
			stylesheet : generateStylesheets.bind(this, spriteName)
		};

		// Compile and check errors
		nsg(nsgOptions, (err) =>
		{
			// If we have an error
			if (err)
			{
				console.log('');
				console.log(`Error while creating sprite ${error}`.red.bold);
				process.exit(1);
			}

			// If every sprite has compiled
			else if (--totalSprites === 0)
			{
				// We are done
				resolve();
			}
		});
	});

});