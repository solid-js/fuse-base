// File manager
const { Files } = require('@zouloux/files');

// Load solid constants
const solidConstants = require('../solid-constants.config');

// Notification module
const solidNotif = require('./solid-notif');

// Local dependencies
let verbose = true;
let fuseBox;
let options;



/**
 * Public API
 */
module.exports = {

	/**
	 * Init Solid checker
	 * @param pVerbose Enable console logs
	 * @param pFuseBox FuseBox instance
	 * @param pOptions CLI options
	 */
	init: (pVerbose, pFuseBox, pOptions) =>
	{
		verbose = pVerbose;
		fuseBox = pFuseBox;
		options = pOptions;
	},

	/**
	 * Init Typescript Checker.
	 * Will check all Typescript files if no bundles are provided.
	 * Otherwise, it will install hook to check after compiling on every bundles.
	 * @param pExitOnError Exit on error, or keep running if we are in dev mode.
	 * @param pBundles Fuse Bundle list to install hook on. Will check on every bundles after compiling.
	 */
	typescript: ( pExitOnError = true, pBundles ) =>
	{
		// Get Typescript checking helper
		const { TypeHelper } = require('fuse-box-typechecker');

		// Create TypeHelper
		// @see : https://github.com/fuse-box/fuse-box-typechecker
		let typeHelper = TypeHelper({
			name: 'TypeChecker',

			// tsconfig file, relative to the src path
			tsConfig: '../tsconfig.json',
			basePath: solidConstants.srcPath,
			shortenFilenames: true
		});
		verbose && console.log('');

		// Shortcut method to run Type Checking with alerts if anything failed
		const runTypeCheck = async (pRunAsync) =>
		{
			// Type checking can be long, so we show this to know what is going on
			console.log(`\n  → Checking Typescript bundles ...`.cyan);

			// Play check starting sound
			(!options.muted && pRunAsync)
			&&
			solidNotif.playSound( 'Pop' );

			// Run type checker
			const totalErrors = (
				pRunAsync
				? await typeHelper.runPromise()
				: typeHelper.runSync()
			);

			// Play check ended sound (success or error)
			(!options.muted && pRunAsync)
			&&
			solidNotif.playSound(
				totalErrors > 0 ? 'Sosumi' : 'Tink'
			);

			// If we have errors
			// Play a sound from the terminal if there is an error
			(totalErrors > 0 && verbose)
			? console.log("\007")
			: console.log(`\n  → Bundles checked !`.green);
			verbose && console.log('');

			// Quit with an error if we are in quantum mode
			if ( pExitOnError && totalErrors > 0 )
			{
				process.exit(1);
			}
		};

		// If we have no bundles to configure from parameter
		if (pBundles == null)
		{
			// Exec directly the type checker and do not init type check on bundles
			runTypeCheck( false );
			return;
		}

		// Bundle completion counter to type check only when every bundles are compiled
		let completedBundles = 0;

		// Browser every bundles
		pBundles.map( app =>
		{
			// When an app complete compilation
			app.completed( proc =>
			{
				// Count until every bundle are compiled
				if ( ++completedBundles >= pBundles.length )
				{
					// Reset counter
					completedBundles = 0;

					// Run typecheck on all bundle at once
					runTypeCheck( true );
				}
			});
		});
	},

	/**
	 * Start checking of all less files.
	 * Returns a Promise which will fail if there is any error..
	 * @param pExitOnError Exit on error, or keep running if we are in dev mode.
	 */
	less: (pExitOnError = true) => new Promise( (resolve, reject ) =>
	{
		// Browser every files.
		const lessFiles = Files.getFiles(`${solidConstants.srcPath}**/*.less`).files;

		// Files counter
		const totalLessFiles = lessFiles.length;
		let checkedLessFiles = 0;

		// Log on verbose mode
		verbose && console.log(`  → Checking ${totalLessFiles} LESS files ...`.cyan);

		// Child process to spawn less commands
		const ChildProcess = require('child_process');

		// Method to parallelise less checking in batches
		const launchAsyncProcessList = (pMaxParallelProcesses) =>
		{
			// Iterate to make our batch
			const destination = Math.min(
				totalLessFiles,
				checkedLessFiles + pMaxParallelProcesses
			);
			for (let i = checkedLessFiles; i < destination; i ++)
			{
				// Target our less file path
				const lessFile = lessFiles[ i ];
				const shortFileName = lessFile.substr( solidConstants.srcPath.length, lessFile.length );

				// We do in parallel, intense !
				// BETTER : Trouver un moyen de ne pas recheck plusieurs fois les mêmes fichiers
				// Lint with lessc, do not compile anything
				let lessLint = ChildProcess.spawn(
					'./node_modules/less/bin/lessc',
					['--lint', '--no-color', lessFile]
				);

				// Less linter process finished
				lessLint.on('exit', (code) =>
				{
					// Get error
					let stderr = (lessLint.stderr.read() || '').toString();

					// Exit with error code if there is anything wrong
					if (stderr !== '' || code !== 0)
					{
						verbose && console.log(`	✗ ${ shortFileName }\n`.red.bold);
						verbose && console.log( stderr.red.bold );
						verbose && console.log("\007");
						reject( stderr );
						pExitOnError && process.exit(1);
						return;
					}

					// File checked, log on verbose mode
					verbose && console.log(`    ✓ ${ shortFileName }`.grey);

					// Every files are compiled
					if (++checkedLessFiles >= totalLessFiles)
					{
						// Show success
						verbose && console.log(`  → ${ totalLessFiles } Less files checked !`.green);

						// We are done !
						resolve();
					}

					// Resolve when every file is checked
					else if (checkedLessFiles >= destination)
					{
						launchAsyncProcessList(pMaxParallelProcesses);
					}
				});
			}
		}

		// Start less check batch and resolve promise when we are done
		// This value seems to be a good ratio between crushing our CPU and checking duration
		launchAsyncProcessList(20, resolve);
	})
}