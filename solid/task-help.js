

/**
 * TODO : En dire plus sur setup, dire que ça peut aussi tourner pendant un projet
 * TODO : Indiquer le fichier config de chaque task
 */


/**
 * All tasks and associated help, by type
 */
const tasksMessages = {
	'Setup a new project' : {
		'setup' : `
			Start setup of a new Solid project interactively.
		`,
	},

	'Environment dependent properties' : {
		'selectEnv' : `
			Select env for deployer. 

			${'%envName%'.bold}
				- Deploy env without showing env list through CLI.
		`
	},

	'Fuse bundles and compiling' : {
		'dev' : `
			Run fuse, compile all bundles and watch.
			Will check Typescript files and show Less errors inside the browser.

			${'--quantum'.bold}
				- Enable code splitting, async modules will be in separated bundled files.
				- Enable treeshaking
				- Disable Hot Module Reloading and changes watching

			${'--uglify'.bold}
				- Uglify bundles
				- Works only if quantum is enabled

			${'--reload'.bold}
				- Force full page reloading and disable Hot Module Reloading

			${'--port %portNumber%'.bold}
				- Change Server and HMR listening port, if running other fuse projects at the same time.

			${'--quiet'.bold}
				- Disable console logs.

			${'--noTypeCheck'.bold}
				- Disable type checking, not advised.

			${'--noWatch'.bold}
				- Disable watch and HMR, just build dev scripts and quit.
		`,

		'production' : `
			Compile sprites and all bundles for production (Quantum + Uglify enabled).
			Will check Less and Typescript files before compiling.

			${'--quiet'.bold}
				- Disable console logs.

			${'--noLessCheck'.bold}
				- Disable less checking in production.

			${'--noTypeCheck'.bold}
				- Disable type checking in production.
		`,
	},

	'Cleaning and resolving issues' : {
		'clean' : `
			Clean Fuse cache and generated files.
			Run it if it feels weird. 
		`,
		'cleanSprites' : `
			Clean generated sprites.
		`,
		'afterPull' : `
			Update after a ${'git pull'.bold} with coworkers
			- Updates NPM modules
			- Clean every generated files and caches
			- Remove generated sprites
			- Recreate sprites
			- Re-launch dev mode
			Useful after ${'git pull'.bold}
		`,
		'noProblemo' : `
			Tries to solve common problems :
			- Remove and re-install all node modules
			- Clean every generated files and caches
			- Remove generated sprites
			- Recreate sprites
			- Check syntax and validity of every less files
			- Check syntax and validity of every typescript files
			- Re-launch dev mode
		`
	},

	'Less and Typescript error checking' : {
		'lessCheck' : `
			Lint every Less files and throw if there is an error on any file.
			Useful to block Continuous Integration process on errors.
			Automatically done by ${'production'.bold} task.
		`,
		'typeCheck' : `
			Lint every Typescript files and throw if there is an error on any file.
			Automatically done by ${'dev'.bold} and ${'production'.bold} tasks.
		`
	},

	'Creating new components' : {
		'scaffold' : `
			Create a new component / bundles / fonts / sprites interactively. 
		`,
	},

	'Sprites and images' : {
		'sprites' : `
			Clean and compile sprites. 
		`,

		'imagemin' : `
			Optimize every images inside src folder and create .min versions with imagemin.
			Sprites images will not be optimized because ${'node solid sprites'.bold} handles it.
			Target the .min file from Less or Typescript files after this task.
			Lonely .min files will be removed.
		`,
	}
};

/**
 * Public API
 */
module.exports = {
	help: () =>
	{
		console.log('');

		// Browse task types
		Object.keys( tasksMessages ).map( taskType =>
		{
			// Construct a fat banner
			const taskBannerWidth = 80;
			let taskBannerText = '  ' + taskType;
			let spacesBanner = '';
			for (let i = 0; i < taskBannerWidth; i ++)
			{
				spacesBanner += ' ';
				if (taskBannerText.length < taskBannerWidth)
				{
					taskBannerText += ' ';
				}
			}

			// Show task type in a fat banner
			console.log('');
			console.log( ' ' + spacesBanner.inverse.bold );
			console.log( ' ' + taskBannerText.inverse.bold );
			console.log( ' ' + spacesBanner.inverse.bold + "\n");

			// Browse tasks
			Object.keys( tasksMessages[ taskType ] ).map( taskName =>
			{
				// Show task name
				console.log(`   node solid ${ taskName }`.yellow.bold);

				// Show description
				console.log(
					tasksMessages[ taskType ][ taskName ]
					.split("\n\t\t").join("\n ")
					.replace(/(\t)/gmi, '    ')
				);
			});
		});

		// Quit so we do not get sparky log
		process.exit();
	}
};
