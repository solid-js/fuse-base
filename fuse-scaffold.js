
const Inquirer = require('inquirer');
const path = require('path');
const switches = require('./fuse-switches');
const { Files } = require('./helpers/files');
const { QuickTemplate } = require('./helpers/quick-template');
const { CapitalizeFirst } = require('./helpers/capitalize');

// ----------------------------------------------------------------------------- COMMON TASKS

/**
 * Ask for the bundle
 */
const askWhichBundle = (pNoCommon, pNoAsync) =>
{
	// All app and async bundles
	const bundlesList = [];

	// Get app bundles
	const appBundlesPaths = Files.getFolders(`${switches.srcPath}*`).files;

	// Browser app bundles
	appBundlesPaths.map( appBundlePath =>
	{
		// Skip common bundle if asked
		if (pNoCommon && path.basename(appBundlePath) === switches.commonBundleName) return;

		// Add this app bundle into bundles list
		appBundlePath = `${appBundlePath}/`;
		bundlesList.push( appBundlePath );

		// Skip async bundles if asked
		if (pNoAsync) return;

		// Get async bundles into this bundle
		Files.getFolders(`${ appBundlePath }${ switches.asyncPath }/*`).all( file =>
		{
			// Add this async bundle to bundles list
			bundlesList.push(`${file}/`);
		});
	});

	return Inquirer.prompt({
		type: 'list',
		name: 'bundleName',
		message : 'Which bundle ?',
		choices: bundlesList
	});
}

/**
 * Ask for the sub-folder
 */
const askWhichSubFolder = () =>
{
	return Inquirer.prompt({
		type: 'list',
		name: 'subFolder',
		message : 'Which sub-folder ?',
		choices: switches.includedFoldersWithoutImports
	});
}

/**
 * Ask for the component name
 */
const askComponentName = () =>
{
	return Inquirer.prompt({
		type: 'input',
		message: 'Component name ? (camel case)',
		name: 'componentName'
	});
}

/**
 * Ask question and scaffold a component with a specific script template
 * @param scriptTemplate Name of the script template file to use
 * @returns {Promise<any>}
 */
const scaffoldComponent = async ( scriptTemplate ) =>
{
	return new Promise( async ( resolve ) =>
	{
		// Get bundle path
		let bundlePath = '';
		await askWhichBundle().then( answer =>
		{
			bundlePath = answer.bundleName;
		});

		// Get sub-folder (like component / pages ...)
		let subFolder = '';
		await askWhichSubFolder().then( answer =>
		{
			subFolder = answer.subFolder;
		})

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
		let componentPath = `${bundlePath}${subFolder}/${lowerComponentName}/${upperComponentName}`;

		// Check if component already exists
		if (Files.getFiles(`${componentPath}.tsx`).files.length > 0)
		{
			console.log(`This component already exists. Aborting.`.red.bold);
			return;
		}

		// Scaffold the script
		Files.new(`${componentPath}.tsx`).write(
			QuickTemplate(
				Files.getFiles('skeletons/scaffold/' + scriptTemplate).read(),
				{
					capitalComponentName: upperComponentName
				}
			)
		);

		// Scaffold the style
		Files.new(`${componentPath}.less`).write(
			QuickTemplate(
				Files.getFiles('skeletons/scaffold/componentStyle').read(),
				{
					capitalComponentName: upperComponentName
				}
			)
		);

		// Done
		resolve();
	});
}

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
				choices : ['React', 'Zepto']
			}).then( anwser =>
			{
				componentSystem = anwser.componentSystem;
			});

			// Ask for bundle name
			Inquirer.prompt({
				type: 'input',
				message: 'App bundle name ? (snake-case)',
				name: 'bundleName'
			}).then( answer =>
			{
				// Get bundle name from answer
				const bundleName = answer.bundleName;

				// Check if bundle already exists
				if (Files.getFolders(`${ switches.srcPath }${ bundleName }`).files.length > 0)
				{
					console.log(`This bundle already exists. Aborting.`.red.bold);
					return;
				}

				// Create default folders with .gitkeep files
				switches.includedFoldersWithoutImports.concat('models', 'async')
				.map( folderName =>
				{
					Files.new(`${ switches.srcPath }${ bundleName }/${ folderName }/.gitkeep`).write('');
				});

				// Create index
				Files.new( `${ switches.srcPath }${ bundleName }/${ switches.entryPoint }` ).write(
					QuickTemplate(
						Files.getFiles('skeletons/scaffold/appBundleIndex').read(),
						{
							bundleName: bundleName
						}
					)
				);

				// Create main script
				Files.getFiles(`skeletons/scaffold/appBundle${componentSystem}MainScript`)
				.copyTo( `${ switches.srcPath }${ bundleName }/Main.tsx`);

				// Create style gateway so relative imports will work
				Files.new(`${ switches.srcPath }${ bundleName }/Main.less`).write(
					QuickTemplate(
						Files.getFiles('skeletons/scaffold/appBundleStyle').read(),
						{
							commonPath: switches.commonBundleName
						}
					)
				);

				// TODO : INIT APP VIEW WITH VIEW STACK
			});
		}
	},

	/**
	 * Scaffold an async bundle
	 */
	{
		name: 'Async bundle',
		exec: async () =>
		{
			// Get bundle path
			// Disallow common and async bundles
			let bundlePath = '';
			await askWhichBundle(true, true).then( answer =>
			{
				bundlePath = answer.bundleName;
			});

			// Ask for bundle name
			Inquirer.prompt({
				type: 'input',
				message: 'Async bundle name ? (snake-case)',
				name: 'bundleName'
			}).then( answer =>
			{
				// Get bundle name from answer
				const bundleName = answer.bundleName;

				// Root path of async bundles
				const asyncRoot = `${ bundlePath }${ switches.asyncPath }`;

				// Check if bundle already exists
				if (Files.getFolders(`${ asyncRoot }${ bundleName }`).files.length > 0)
				{
					console.log(`This bundle already exists. Aborting.`.red.bold);
					return;
				}

				// Create default folders
				switches.includedFoldersWithoutImports
				.map( folderName =>
				{
					Files.new(`${ asyncRoot }${ bundleName }/${ folderName }/.gitkeep`).write('');
				});

				// Create entry point
				Files.getFiles('skeletons/scaffold/asyncBundleEntryPoint')
				.copyTo( `${ asyncRoot }${ bundleName }/Main.tsx` )

				// Create style gateway so relative imports will work
				Files.getFiles('skeletons/scaffold/asyncBundleStyle')
				.copyTo(`${ asyncRoot }${ bundleName }/main.less`);
			});
		}
	},


	// Separator
	{ name: new Inquirer.Separator() },


	/**
	 * Scaffold a Zepto based component
	 */
	{
		name: 'Zepto component',
		exec: async () =>
		{
			await scaffoldComponent('zeptoComponentScript');
		}
	},

	/**
	 * Scaffold a react based component
	 */
	{
		name: 'React component',
		exec: async () =>
		{
			await scaffoldComponent('reactComponentScript');
		}
	},

	/**
	 * Scaffold a react based page
	 */
	{
		name: 'React page',
		exec: async () =>
		{
			await scaffoldComponent('reactPageScript');
		}
	},


	// Separator
	{ name: new Inquirer.Separator() },


	/**
	 * Scaffold a new sprite
	 */
	{
		name: 'Sprite',
		exec: () =>
		{
			Inquirer.prompt({
				type: 'input',
				message: 'Sprite name ? (avoid using word "sprite" and use snake-case)',
				name: 'spriteName'
			}).then( answer =>
			{
				// Destination sprite config file name
				const destinationSpriteConfigFileName = '_sprite-config.js';

				// Get sprite name from answer
				const spriteName = answer.spriteName;

				// Compute folder path with trailing slash
				const folderPath = `${ switches.srcPath }${ switches.commonBundleName }/${ switches.spritesFolder }${ spriteName }/`;

				// Create sprite config and folder
				Files.new(`${folderPath}${destinationSpriteConfigFileName}`).write(
					Files.getFiles(`skeletons/scaffold/spriteConfig`).read()
				);

				// Log instructions
				console.log('');
				console.log(`Sprite created. Add images into ${folderPath} folder, named with snake-case convention.`);
				console.log(`Sprite can be configured by editing ${destinationSpriteConfigFileName} file.`);
			});
		}
	},

	// Separator
	{ name: new Inquirer.Separator() },

]

// ----------------------------------------------------------------------------- PUBLIC API

/**
 * Only export scaffolder promise
 */
module.exports = new Promise(

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
			pageSize: 10
		}).then( answer =>
		{
			// Get scaffolder index
			const scaffolderIndex = scaffolderTypes.indexOf( answer.type );

			// Start this scaffolder
			scaffolders[ scaffolderIndex ].exec();
		});
	}
);



