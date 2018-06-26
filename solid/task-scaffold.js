const Inquirer = require('inquirer');
const path = require('path');
const { Files } = require('@zouloux/files');
const { QuickTemplate } = require('./helper-template');
const { CapitalizeFirst } = require('./helper-capitalize');

// Load solid constants
const solidConstants = require('../solid-constants.config');

// ----------------------------------------------------------------------------- LOGS

/**
 * Show a success message
 * @param pMessage Message to show
 */
const showSuccess = (pMessage) =>
{
	console.log(`\n  → ${ pMessage }\n`.green);
}

/**
 * Show set of instructions and examples
 * @param pInstructions instructions list
 * @param pExamples examples list, optional
 */
const showInstructions = (pInstructions, pExamples) =>
{
	console.log('Read carefully :'.yellow.bold);

	// Show instructions
	pInstructions.map( (instruction, i) =>
	{
		console.log(`${ i + 1}. ${ instruction }`.yellow );
	});

	// Show examples
	pExamples && pExamples.map( (example, i) =>
	{
		i === 0 && console.log('');
		console.log(`${ example }`.yellow );
	});

	console.log('');
}


// ----------------------------------------------------------------------------- COMMON TASKS

/**
 * Ask for the bundle
 */
const askWhichBundle = (pNoCommon) =>
{
	// All app and async bundles
	const bundlesList = [];

	// Get app bundles
	const appBundlesPaths = Files.getFolders(`${ solidConstants.srcPath }*`).files;

	// Browser app bundles
	appBundlesPaths.map( appBundlePath =>
	{
		// Skip common bundle if asked
		if ( pNoCommon && path.basename( appBundlePath ) === solidConstants.commonBundleName ) return;

		// Add this app bundle into bundles list
		appBundlePath = `${appBundlePath}/`;
		bundlesList.push( appBundlePath );
	});

	return Inquirer.prompt({
		type: 'list',
		name: 'bundleName',
		message : 'Which bundle ?',
		choices: bundlesList
	});
}

/**
 * Ask for the component folder
 */
const askWhichComponentFolder = () =>
{
	return Inquirer.prompt({
		type: 'list',
		name: 'subFolder',
		message : 'Which component folder ?',
		choices: solidConstants.componentCompatibleFolders
	});
}

/**
 * Ask for the component name
 */
const askComponentName = () =>
{
	return Inquirer.prompt({
		type: 'input',
		message: 'Component name ? (camelCase)',
		name: 'componentName'
	});
}

/**
 * Ask question and scaffold a component with a specific script template
 * @param scriptTemplate Name of the script template file to use
 * @returns {Promise<any>}
 */
const scaffoldComponent = ( scriptTemplate ) => new Promise( async ( resolve ) =>
{
	// Get bundle path
	let bundlePath = '';
	await askWhichBundle().then( answer =>
	{
		bundlePath = answer.bundleName;
	});

	// Static sub-folder for pages
	let subFolder = '';
	if (scriptTemplate === 'reactPageScript')
	{
		subFolder = 'pages'
	}

	// Get sub-folder for components
	else
	{
		await askWhichComponentFolder().then( answer =>
		{
			subFolder = answer.subFolder;
		})
	}

	// Get component name
	let componentName = '';
	await askComponentName().then( answer =>
	{
		componentName = answer.componentName;
	});

	// Lower and capital component name
	let lowerComponentName = CapitalizeFirst( componentName, false);
	let upperComponentName = CapitalizeFirst( componentName, true);

	// Base path of the component (no extension here)
	let componentPath = `${ bundlePath }${ subFolder }/${ lowerComponentName }/${ upperComponentName }`;

	// Check if component already exists
	if ( Files.getFiles(`${ componentPath }.tsx`).files.length > 0 )
	{
		console.log(`This component already exists. Aborting.`.red.bold);
		return;
	}

	// Scaffold the script
	Files.new(`${ componentPath }.tsx`).write(
		QuickTemplate(
			Files.getFiles(`${ solidConstants.skeletonsPath }components/${ scriptTemplate }`).read(),
			{
				capitalComponentName: upperComponentName
			}
		)
	);

	// Scaffold the style
	Files.new(`${ componentPath }.less`).write(
		QuickTemplate(
			Files.getFiles(`${ solidConstants.skeletonsPath }components/componentStyle`).read(),
			{
				capitalComponentName: upperComponentName
			}
		)
	);

	// Done
	showSuccess('Component created !');
	resolve();
});

// ----------------------------------------------------------------------------- SCAFFOLDERS

const scaffolders = [

	// Separator
	{ name: new Inquirer.Separator() },

	/**
	 * Scaffold an app bundle
	 */
	{
		name: 'App bundle',
		exec: async () =>
		{
			// Ask for component system
			let componentSystem = '';
			await Inquirer.prompt({
				type: 'list',
				message: 'Which component system ?',
				name: 'componentSystem',
				choices : ['React', 'DOM']
			}).then( anwser => componentSystem = anwser.componentSystem );

			// Ask for bundle name
			Inquirer.prompt({
				type: 'input',
				message: 'App bundle name ? (dash-case)',
				name: 'bundleName'
			}).then( answer =>
			{
				// Get bundle name from answer
				const bundleName = answer.bundleName;

				// Check if bundle already exists
				if ( Files.getFolders(`${ solidConstants.srcPath }${ bundleName }`).files.length > 0 )
				{
					console.log(`This bundle already exists. Aborting.`.red.bold);
					return;
				}

				// Create default folders with .gitkeep files
				solidConstants.appBundleFoldersToScaffold.map( folderName =>
				{
					Files.new(`${ solidConstants.srcPath }${ bundleName }/${ folderName }/.gitkeep`).write('');
				});

				// Create index
				Files.new( `${ solidConstants.srcPath }${ bundleName }/${ solidConstants.entryPoint }` ).write(
					QuickTemplate(
						Files.getFiles(`${ solidConstants.skeletonsPath }bundles/appBundleIndex`).read(),
						{
							bundleName: bundleName
						}
					)
				);

				// Create main script
				Files.getFiles(`${ solidConstants.skeletonsPath}bundles/appBundle${componentSystem}MainScript`)
				.copyTo( `${ solidConstants.srcPath }${ bundleName }/Main.tsx`);

				// Create style gateway so relative imports will work
				Files.new(`${ solidConstants.srcPath }${ bundleName }/Main.less`).write(
					QuickTemplate(
						Files.getFiles(`${ solidConstants.skeletonsPath}bundles/appBundleStyle`).read(),
						{
							commonPath: solidConstants.commonBundleName
						}
					)
				);

				// Scaffold the AppView script
				Files.getFiles(`${ solidConstants.skeletonsPath }bundles/appBundle${componentSystem}AppView`)
				.copyTo(`${ solidConstants.srcPath }${ bundleName }/components/appView/AppView.tsx`);

				// Scaffold the AppView style
				Files.new(`${ solidConstants.srcPath }${ bundleName }/components/appView/AppView.less`).write(
					QuickTemplate(
						Files.getFiles(`${ solidConstants.skeletonsPath }components/componentStyle`).read(),
						{
							capitalComponentName: 'AppView'
						}
					)
				);
			});
		}
	},


	// Separator
	{ name: new Inquirer.Separator() },


	/**
	 * Scaffold a DOM based component
	 */
	{
		name: 'DOM component',
		exec: scaffoldComponent.bind(this, 'DOMComponentScript')
	},

	/**
	 * Scaffold a react based component
	 */
	{
		name: 'React component',
		exec: scaffoldComponent.bind(this, 'reactComponentScript')
	},

	/**
	 * Scaffold a react based page
	 */
	{
		name: 'React page',
		exec: scaffoldComponent.bind(this, 'reactPageScript')
	},


	// Separator
	{ name: new Inquirer.Separator() },


	/**
	 * Scaffold a new sprite
	 */
	{
		name: 'Sprite',
		exec: async () =>
		{
			// Get bundle path
			let bundlePath = '';
			await askWhichBundle().then( answer =>
			{
				bundlePath = answer.bundleName;
			});

			// Get sprite name
			let spriteName = '';
			await Inquirer.prompt({
				type: 'input',
				message: 'Sprite name ? (avoid using word "sprite" and use dash-case)',
				name: 'spriteName'
			}).then( answer => spriteName = answer.spriteName );

			// Compute folder path with trailing slash
			const folderPath = `${ bundlePath }${ solidConstants.spritesPath }${ spriteName }/`;

			// Destination sprite config file name
			const destinationConfigPath = `${ bundlePath }${ solidConstants.spritesPath }sprite-${spriteName}.config.js`;

			// Create folders
			Files.new( folderPath ).createFolders();

			// Create sprite config and folder
			Files.new( destinationConfigPath ).write(
				Files.getFiles(`${ solidConstants.skeletonsPath }resources/spriteConfig`).read()
			);

			// Log instructions
			showSuccess('Sprite created !');
			showInstructions([
				`Add PNG images into ${ folderPath.bold } folder, named with ${ 'dash-case'.bold } convention.`,
				`Sprite can be configured by editing ${ destinationConfigPath.bold } file.`,
				`Launch ${ `node solid sprites`.bold } to generate less files.`,
				`Import your sprite in ${ `${ bundlePath }Main.less`.bold } after a first ${ `node solid sprites`.bold }. `,
			]);
		}
	},

	/**
	 * Scaffold a new font face
	 */
	{
		name: 'Font face',
		exec: async () =>
		{
			// Where fonts are stored
			const fontsFolder = `${solidConstants.srcPath}${solidConstants.commonBundleName}/fonts/`;

			// Convertion instructions
			console.log('');
			showInstructions([
				`Go to ${ 'http://www.font2web.com/'.bold } and convert your font.`,
				'Extract archive and only keep .eot .ttf .woff files.',
				'Rename them with the same filename, as dash-case.',
				'Put them into a folder named with the same name.',
				`Move this folder into ${ fontsFolder.bold } directory.`,
			], [
				`Ex : ${ fontsFolder }helvetica-neue-bold/helvetica-neue-bold.{eot,ttf,woff}`.bold,
			]);

			// Get file name
			let filename = '';
			await Inquirer.prompt({
				type: 'input',
				message: 'What is the lower-dash-case filename of the font, with font variant ? (ex : helvetica-neue-bold)',
				name: 'filename'
			}).then( answer => filename = answer.filename );

			// Get mixin name
			let mixinName = '';
			await Inquirer.prompt({
				type: 'input',
				message: 'What CamelCase mixin name do you want, without font variant ? (ex : HelveticaNeue)',
				name: 'mixinName'
			}).then( answer => mixinName = CapitalizeFirst(answer.mixinName, true) );

			// Get font variant
			let fontVariant = '';
			await Inquirer.prompt({
				type: 'input',
				message: 'What is the lowerCamelCase font variant ? (ex : bold or regular)',
				name: 'fontVariant'
			}).then( answer => fontVariant = CapitalizeFirst(answer.fontVariant, false) );

			// Scaffold file
			Files.new(`${fontsFolder}${mixinName}-${fontVariant}.less`).write(
				QuickTemplate(
					Files.getFiles(`${ solidConstants.skeletonsPath }resources/fontStyle`).read(),
					{
						fontFamilyName: filename,
						fontClassName: mixinName,
						fontVariant: fontVariant
					}
				)
			);

			// Show import instructions
			showSuccess('Font face created !');
			showInstructions([
				`Import your font as in ${ `${ solidConstants.srcPath }${ solidConstants.commonBundleName }/Main.less`.bold }`
			]);
		}
	},

	// Separator
	{ name: new Inquirer.Separator() },

];

// ----------------------------------------------------------------------------- PUBLIC API

module.exports = {

	/**
	 * Start scaffolder
	 */
	run: () => new Promise(

		( resolve ) =>
		{
			// Get scaffolder to present listing to user
			let scaffolderTypes = scaffolders.map( scaffolder => scaffolder.name );

			// List available scaffolders to user
			Inquirer.prompt({
				type: 'list',
				name: 'type',
				message: 'What kind of component to create ?',
				choices: scaffolderTypes,
				pageSize: 20
			}).then( answer =>
			{
				// Get scaffolder index
				const scaffolderIndex = scaffolderTypes.indexOf( answer.type );

				// Start this scaffolder
				scaffolders[ scaffolderIndex ].exec();
			});
		}
	)

}