
const path = require('path');
const glob = require('glob');

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

		Object.keys( pShims ).map( libPath =>
		{
			pShims[ libPath ].map( fileName =>
			{
				let libName, libFile;

				if ( Array.isArray(fileName) )
				{
					libName = fileName[0];
					libFile = libPath + fileName[1];
				}
				else
				{
					libName = path.parse( fileName ).name;
					libFile = libPath + fileName;
				}

				shimOutput[ libName ] = {
					source : libFile,
					exports : libName
				};
			});
		});

		return shimOutput;
	}
};