const Inquirer = require('inquirer');
const { Files } = require('@zouloux/files');
require('colors');
const solidConstants = require('../solid-constants.config');

module.exports = {
	setup: () => new Promise( async (resolve) =>
	{
		// Read package.json
		const packageJson = require('../package');

		let projectName = packageJson.name;
		let projectNameForIDE = Files.getFiles('.idea/.name').read();
		let projectVersion = packageJson.version;
		let projectAuthor = packageJson.author;

		// Get IDE infos if this is the first setup
		if (projectNameForIDE === 'Solidify - Project')
		{
			// TODO -> Définir le nom pour l'IDE
			// TODO : Changer le contenu de ".name"
			// TODO : Renommer "Solidify - Project.iml"
			// TODO : Altérer le chemin dans "modules.xml"

			/*
			// Ask user for project name
			await Inquirer.prompt({
				type: 'input',
				message: 'Project name for IDE ? (formatted : "Category - Project")',
				name: 'projectNameForIDE'
			}).then( answer => projectNameForIDE = answer.projectNameForIDE);
			*/
		}

		// Get package infos if this is the first setup
		if (projectName === "solid-fuse-base")
		{
			// Ask user for project name
			await Inquirer.prompt({
				type: 'input',
				message: 'Project name for package.json ? (dash-case)',
				name: 'projectName'
			}).then( answer => projectName = answer.projectName);

			// Ask user for author
			await Inquirer.prompt({
				type: 'input',
				message: 'Author or company name ?',
				name: 'projectAuthor'
			}).then( answer => projectAuthor = answer.projectAuthor);

			// Reset project version
			projectVersion = '0.1.0';
		}

		// Set name and version into package.json
		Files.getFiles('package.json').alterJSON( packageObject =>
		{
			// TODO : Ask for react
			// TODO : Ask for zepto
			// TODO : Remove from package and do a prune after ?
			// TODO : Or add and do an install ?

			packageObject.version = projectVersion;
			packageObject.name = projectName;
			packageObject.author = projectAuthor;

			return packageObject
		});


		// Setup default env
		Files.new( solidConstants.envPath ).write('default');

		// Show success
		console.log('');
		console.log(`Project ${projectName} created ! Type ${'node solid'.bold} to start.`.green);
		console.log('');

		// TODO : Add grav option
		// TODO : Add pebble option


		// TODO : Notify to edit solid-fuse.config.js

		resolve();
	})
};