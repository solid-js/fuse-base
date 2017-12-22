
const path = require('path');
const glob = require('glob');
const fse = require('fs-extra');
const colors = require('colors'); // @see : https://github.com/marak/colors.js/

/*
'node_modules/another-lib/' : [
	['LibName', 'FileName.js'],

	'FileName.js'
]
*/
module.exports = {

	/**
	 * TODO : DOC
	 * @param pBundlesGlob
	 */
	getAsyncBundlesFromFileSystem : (pBundlesGlob) =>
	{
		// Get async bundles entry points to automate code splitting.
		return glob.sync( pBundlesGlob ).map( (file) =>
		{
			// Split file path components
			let filePath = file.split('/');

			// Return bundle name and bundle entry point
			return {
				// Bundle name (starting with lowerCase)
				bundleName: filePath[ filePath.length - 2 ],

				// Bundle entry point (starting with UpperCase and with ts(x) extension)
				entryPoint : filePath[ filePath.length - 1 ]
			};
		});
	},

	/**
	 * TODO : DOC
	 * @param pShims
	 * @returns {{}}
	 */
	generateShims : (pShims) =>
	{
		const shimOutput = {};

		const addShimOutput = (libFile, libName) =>
		{
			shimOutput[ libName ] = {
				source : libFile,
				exports : libName
			};
		};

		Object.keys( pShims ).map( libPath =>
		{
			const pathFiles = pShims[ libPath ];

			if ( !Array.isArray(pathFiles) )
			{
				addShimOutput(
					libPath + pathFiles,
					path.parse( pathFiles ).name
				);
			}
			else
			{
				pathFiles.map( fileName =>
				{
					Array.isArray( fileName )

					? addShimOutput(
						libPath + fileName[1],
						fileName[0]
					)

					: addShimOutput(
						libPath + fileName,
						path.parse( fileName ).name
					);
				});
			}
		});

		return shimOutput;
	},


	cleanPath : (pGlob) =>
	{
		console.log(`Cleaning ${pGlob} ...`.yellow);

		// Remove every compiled js
		glob.sync( pGlob ).map( file =>
		{
			fse.removeSync( file ) && console.log( `	Deleted ${file}`.grey );
		});
	}
};