
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
const askWhichBundle = () =>
{
	return Inquirer.prompt({
		type: 'list',
		name: 'bundleName',
		message : 'Which bundle ?',
		choices: [ switches.srcPath ].concat(
			Files.getFolders(`${switches.srcPath}${switches.asyncPath}/*`).files.map( file => file + '/')
		)
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
	/**
	 * Scaffold a jQuery based component
	 */
	{
		name: 'jQuery based component',
		exec: async () =>
		{
			await scaffoldComponent('jqueryComponentScript');
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

	/**
	 * Scaffold an async bundle
	 */
	{
		name: 'Async bundle',
		exec: () =>
		{
			// Ask for bundle name
			Inquirer.prompt({
				type: 'input',
				message: 'Async bundle name ? (camel case)',
				name: 'bundleName'
			}).then( answer =>
			{
				// Lower and capital bundle name
				let lowerBundleName = CapitalizeFirst( answer.bundleName, false);
				let upperBundleName = CapitalizeFirst( answer.bundleName, true);

				// Root path of async bundles
				const asyncRoot = switches.srcPath + switches.asyncPath;

				// Check if component already exists
				if (Files.getFolders(`${asyncRoot}${lowerBundleName}`).files.length > 0)
				{
					console.log(`This async bundle already exists. Aborting.`.red.bold);
					return;
				}

				// Create default folders
				switches.includedFoldersWithoutImports.map( folderName =>
				{
					Files.new(`${asyncRoot}${lowerBundleName}/${folderName}/.gitkeep`).write('');
				});

				// Create entry point
				Files.new(`${asyncRoot}${lowerBundleName}/${upperBundleName}.tsx`).write(
					QuickTemplate(
						Files.getFiles('skeletons/scaffold/asyncBundleEntryPoint').read(),
						{
							capitalBundleName: upperBundleName
						}
					)
				);

				// Create style gateway so relative imports will work
				Files.new(`${asyncRoot}${lowerBundleName}/main.less`).write(
					Files.getFiles('skeletons/scaffold/asyncBundleStyle').read()
				);
			});
		}
	},


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
			choices: scaffolderTypes
		}).then( answer =>
		{
			// Get scaffolder index
			const scaffolderIndex = scaffolderTypes.indexOf( answer.type );

			// Start this scaffolder
			scaffolders[ scaffolderIndex ].exec();
		});
	}
);



