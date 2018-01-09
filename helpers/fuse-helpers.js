
const path = require('path');
const { Files, Folder } = require('./file-list');

module.exports = {

	/**
	 * TODO : DOC
	 * @param pBundlesGlob
	 */
	getAsyncBundlesFromFileSystem : (pBundlesGlob) =>
	{
		// Get async bundles entry points to automate code splitting.
		return Files( pBundlesGlob ).all( file =>
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
	}
};