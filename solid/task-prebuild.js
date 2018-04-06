// File manager
const { Files } = require('@zouloux/files');

// Load solid constants
const solidConstants = require('../solid-constants.config');

// Fuse config, from init public method
let fuseConfig;


/**
 * Public API
 */
module.exports = {

	/**
	 * Init Fuse bundler
	 * @param pFuseConfig Fuse config object to use
	 */
	init : (pFuseConfig) =>
	{
		fuseConfig = pFuseConfig;
	},


	/**
	 * Pre build bundles.ts and pages.ts files.
	 * We do this to have a static tree of dynamic dependencies.
	 * Needed for quantum builds and to patch some Fuse stuff.
	 * @param pAppBundlesNames All app bundle names
	 * @param pAllPagesByBundles All app pages names by bundles
	 */
	preBuildStaticDependencies: (pAppBundlesNames, pAllPagesByBundles) =>
	{
		/**
		 * BUNDLES.TS
		 */

		// bundles.ts template
		const bundlesTemplate = (apps, requires) => (`
			/**
			 * WARNING
			 * Auto-generated file, do not edit !
			 *
			 * This file list all bundles so Fuse can import and start them properly. 
			 */
			module.exports = {
				paths : [\n${apps}
				],
				requires : () => {
					return [\n${requires}
					]
				}
			};`.replace(/(\n\t\t)/gmi, "\n")
		);

		// Create a file that requires those app bundles so common can bootstrap them
		// SolidBundles will use this file
		Files.new(`${solidConstants.srcPath}bundles.ts`).write(
			bundlesTemplate(
				pAppBundlesNames.map(
					bundleNameToRequire => `\t\t\t\t'default/${ bundleNameToRequire }/index'`
				).join(",\n"),
				pAppBundlesNames.map(
					bundleNameToRequire => `\t\t\t\t\trequire('./${ bundleNameToRequire }/index')`
				).join(",\n")
			)
		);


		/**
		 * PAGES.TS
		 */

		// pages.ts template
		const pagesTemplate = (pages) => (`
			/**
			 * WARNING
			 * Auto-generated file, do not edit !
			 *
			 * This file list all pages of this module.
			 * Forcing fuse to keep them and allowing dynamic import with quantum. 
			 */
			module.exports = [${pages}
			];`
			.replace(/(\n\t\t)/gmi, "\n")
		);

		// Browse every bundles to create a pages.ts file for each bundle
		pAppBundlesNames.map( appBundleName =>
		{
			// Browse pages for this bundle to add importer
			const pagesWithImporter = pAllPagesByBundles[ appBundleName ].map(
				(page) => ({
					// Return base page object
					...page,

					// With import function as require or import depending of fuse config
					importFunction: (
						(
							// Force all pages to be imported with require
							fuseConfig.syncPagesImporters === true

							// Force only some pages to be imported with require
							|| (
								Array.isArray( fuseConfig.syncPagesImporters )
								&&
								fuseConfig.syncPagesImporters.indexOf( page.name ) !== -1
							)
						)
						? 'require'
						: 'import'
					)
				})
			);

			// Create a file that requires those app bundles so common can bootstrap them
			Files.new(`${solidConstants.srcPath}${appBundleName}/pages.ts`).write(
				pagesTemplate(
					pagesWithImporter.map( page => `
						{
							page: '${page.name}',
							importer : () => ${ page.importFunction }('./${ page.path }/${ page.name }')
						}`
					)
					.join(",\n")
					.replace(/(\t\t\t\t)/gmi, " \t")
				)
			)
		});
	},

	/**
	 * Generate atoms typescript file from less files inside atoms directory
	 *
	 * Why this and not use a Less plugin like less-plugin-variables-output ?
	 *
	 * The thing is, I tried, but the generated atoms.json from less plugin was async
	 * So it re-trigger compilation.
	 *
	 * I was unable to get it compiled if a removed this file from the watch glob.
	 */
	preBuildAtoms: () =>
	{
		const atomsTemplate = (atoms) => (`
			/**
			 * WARNING
			 * Auto-generated file, do not edit !
			 *
			 * Only updated when node Fuse is launched.
			 * Data are extracted from all less files inside atoms/ directory.
			 */
			export const Atoms =
			{\n${atoms}
			};`
			.replace(/(\n\t\t)/gmi, "\n")
		);

		// Get less files
		const atomsLessFiles = Files.getFiles(`${ solidConstants.srcPath }${ solidConstants.commonBundleName }/${ solidConstants.atomsPath }*.less`);

		// Generated atoms list
		let atomList = [];

		// Browse less files
		atomsLessFiles.all( lessFile =>
		{
			// Read less file
			const lessContent = Files.getFiles(lessFile).read();

			// Browse lines
			lessContent.split("\n").map( split =>
			{
				// Trim line
				split = split.trim();

				// Get @ index (starting of a new less var)
				const atIndex = split.indexOf('@');

				// If @ is not at first index (we are trimmed), next
				if (atIndex !== 0) return;

				// Get colon index (starting of a value in less)
				const colonIndex = split.indexOf(':');

				// If there is no value on this line, next
				if (colonIndex === -1) return;

				// Get optionnal semi colon index
				const semiIndex = split.indexOf(';');

				// Extract var name and trim it
				const varName = split.substring(atIndex + 1, colonIndex).trim();

				// Extract value and trim it
				const value = split.substring(colonIndex + 1, Math.min(split.length, semiIndex)).trim();

				// Add this atom
				atomList.push({
					// Var name
					name : varName,

					// Var value add quotes of not already there
					value: (
						( value.charAt(0) === "'" || value.charAt(0) === '"' )
							? value
							: "'" + value + "'"
					)
				});
			});
		});

		// Write atoms typescript files
		Files.new(`${ solidConstants.srcPath }${ solidConstants.commonBundleName }/${ solidConstants.atomsTypescriptFile }`).write(

			atomsTemplate(
				// Add each atom as a new var
				atomList.map( atom =>
				{
					return `	"${ atom.name }" : ${ atom.value },`
				}).join("\n")
			)
		);
	}
};