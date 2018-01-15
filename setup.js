const Inquirer = require('inquirer');
const { Files } = require('./helpers/files');

// Setup process
const setup = async () =>
{
	// Ask user for project name
	let projectName = '';
	await Inquirer.prompt({
		type: 'input',
		message: 'Project name ? (no spaces)',
		name: 'projectName'
	}).then( answer =>
	{
		projectName = answer.projectName
	});

	// Set name and version into package.json
	Files.getFiles('package.json').alter( content =>
	{
		let packageObject = JSON.parse(content);

		packageObject.version = '1.0.0';
		packageObject.name = projectName;

		return JSON.stringify(packageObject, null, 2);
	});

	// Setup default env
	Files.new('deployer/env').write('default');

	// Show success
	console.log('');
	console.log(`Project ${projectName} created ! Type ${'node fuse'.bold} for more to start.`.green);
	console.log('');
}

// Launch setup
setup();

