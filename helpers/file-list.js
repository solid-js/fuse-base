
const path = require('path');
const glob = require('glob');
const fs = require("fs");
const fse = require('fs-extra');
const colors = require('colors'); // @see : https://github.com/marak/colors.js/

/**
 * FileList class.
 * Can represent a list of files or a folder.
 * Can't represent both files and folders.
 * Target files from a glob.
 * @see https://github.com/isaacs/node-glob
 */
class FileList
{
	/**
	 * Target files list or folder from a glog.
	 * @param pGlob Glob pattern
	 * @param pOnlyFiles If true, will only target existing files. If false, will only target existing folders.
	 */
	constructor (pGlob, pOnlyFiles)
	{
		// Record glob for logging
		this._glob = pGlob;

		// Target files with glob
		const files = glob.sync( this._glob );

		// Filter files or folder
		this._files = files.filter(
			file => (
				// Get only files
				pOnlyFiles
				? fs.lstatSync( file ).isFile()

				// Or get only folders
				: fs.lstatSync( file ).isDirectory()
			)
		);
	}

	/**
	 * Check if this glob is targeting existing files or folders.
	 * @returns {boolean}
	 */
	exists ()
	{
		return (this._files.length > 0);
	}

	/**
	 * Get all files or folders.
	 * @param pHandler First argument will be the file or folder path
	 */
	all ( pHandler )
	{
		return this._files.map( pHandler );
	}

	/**
	 * Delete all targeted files or folders.
	 * No warning.
	 */
	delete ()
	{
		console.log(`FileList.delete ${this._glob} ...`.yellow);

		// Browse files or folders
		this._files.map( file =>
		{
			// Remove
			fse.removeSync( file );
			console.log( `	Deleted ${file}`.grey );
		});
	}

	/**
	 * Move all targeted files or folders inside a directory
	 * @param pDest Directory path where all files / folders will be moved into. No glob.
	 */
	moveTo ( pDest )
	{
		console.log(`FileList.moveTo ${this._glob} ...`.yellow);

		// Browse files or folders
		this._files.map( file =>
		{
			// Get file name and compute destination file name
			const fileName = path.basename( file );
			const destination = path.join(pDest, fileName);

			// Move
			fse.moveSync( file, destination );
			console.log( `	${file} moved to ${destination}`.grey );
		});
	}

	/**
	 * Copy all targeted files or folders inside a directory
	 * @param pDest Directory path where all files / folders will be copied into. No glob.
	 */
	copyTo ( pDest )
	{
		console.log(`FileList.copyTo ${this._glob} ...`.yellow);

		// Browse files or folders
		this._files.map( file =>
		{
			// Get file name and compute destination file name
			const fileName = path.basename( file );
			const destination = path.join(pDest, fileName);

			// Copy
			fse.copySync( file, destination );
			console.log( `	${file} copied to ${destination}`.grey );
		});
	}
}

/**
 * Shortcut to create a FileList of files from a glob.
 */
const Files = pGlob => new FileList(pGlob, true);

/**
 * Shortcut to create a FileList of one folder from a glob.
 */
const Folder = pGlob => new FileList(pGlob, false);

/**
 * Exports public API
 */
module.exports = {
	FileList,
	Files,
	Folder
}