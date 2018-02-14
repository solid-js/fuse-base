const Inquirer = require('inquirer');
const { Files } = require('@zouloux/files');

// Setup process
const setup = async () =>
{
	// Ask user for project name
	let projectName = '';
	await Inquirer.prompt({
		type: 'input',
		message: 'Project name for package.json ? (dash-case)',
		name: 'projectName'
	}).then( answer => projectName = answer.projectName);

	// Set name and version into package.json
	Files.getFiles('package.json').alterJSON( packageObject =>
	{
		packageObject.version = '0.1.0';
		packageObject.name = projectName;
		packageObject.author = '';
		return packageObject
	});

	// Setup default env
	Files.new('deployer/env').write('default');

	// Show success
	console.log('');
	console.log(`Project ${projectName} created ! Type ${'node fuse'.bold} to start.`.green);
	console.log('');

	// Delete this very file
	Files.getFiles('setup.js').delete();
}

// Launch setup
setup();