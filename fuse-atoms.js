const { Files } = require('@zouloux/files');
const switches = require('./fuse-switches');
const { QuickTemplate } = require("./helpers/quick-template");

/**
 * Why this and not use a Less plugin like less-plugin-variables-output ?
 *
 * The thing is, I tried, but the generated atoms.json from less plugin was async
 * So it re-trigger compilation.
 *
 * I was unable to get it compiled if a removed this file from the watch glob.
 */

module.exports = {

	/**
	 * Generate atoms typescript file from less files inside atoms/ directory
	 * @returns {Promise<any>}
	 */
	generateAtoms : () => new Promise(
		(resolve, reject) =>
		{
			// Get less files
			const atomsLessFiles = Files.getFiles(`${ switches.srcPath }${ switches.commonBundleName }/${ switches.atomsPath }*.less`);

			// Generated atoms list
			let atomList = [];

			// Browse less files
			atomsLessFiles.all( lessFile =>
			{
				// Read less file
				const lessContent = Files.getFiles(lessFile).read();

				// Browse lines
				lessContent.split("\n").map( splitted =>
				{
					// Trim line
					splitted = splitted.trim();

					// Get @ index (starting of a new less var)
					const arobaseIndex = splitted.indexOf('@');

					// If @ is not at first index (we are trimmed), next
					if (arobaseIndex !== 0) return;

					// Get colon index (starting of a value in less)
					const colonIndex = splitted.indexOf(':');

					// If there is no value on this line, next
					if (colonIndex === -1) return;

					// Get optionnal semi colon index
					const semiIndex = splitted.indexOf(';');

					// Extract var name and trim it
					const varName = splitted.substring(arobaseIndex + 1, colonIndex).trim();

					// Extract value and trim it
					const value = splitted.substring(colonIndex + 1, Math.min(splitted.length, semiIndex)).trim();

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
			Files.new(`${ switches.srcPath }${ switches.commonBundleName }/${switches.atomsTypescriptFile}`).write(

				// From this template
				QuickTemplate(
					Files.getFiles('skeletons/scaffold/atomsTypescript').read(),
					{
						// Add each atom as a new var
						atoms: atomList.map( atom =>
						{
							return `	"${ atom.name }" : ${ atom.value },`
						}).join("\n")
					}
				)
			);

			// Done
			resolve();
		}
	)
};