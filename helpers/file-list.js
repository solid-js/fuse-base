
const path = require('path');
const glob = require('glob');
const fs = require("fs");
const fse = require('fs-extra');
const colors = require('colors'); // @see : https://github.com/marak/colors.js/



/**
 * FileList class.
 * Can represent a list of files or folders.
 * Can't represent both files and folders.
 * Target files from a glob.
 * @see https://github.com/isaacs/node-glob
 */
class FileList
{
	/**
	 * Target files list or folder from a glog.
	 * Can target files and folder if not filtered.
	 * @param pGlob Glob pattern.
	 * @param pOnlyFiles If true, will only target existing files.
	 * @param pOnlyFolders If true, will only target existing folders.
	 */
	constructor (pGlob, pOnlyFiles, pOnlyFolders)
	{
		// Record glob for logging
		this.glob = pGlob;

		// Target files with glob
		this.files = glob.sync( this.glob );

		// Filter files or folders
		pOnlyFiles && this.onlyExistingFiles();
		pOnlyFolders && this.onlyExistingFolders();
	}

	onlyExistingFiles ()
	{
		// Filter files or folder
		this.files = this.files.filter(
			file => fs.lstatSync( file ).isFile()
		);
	}

	onlyExistingFolders ()
	{
		// Filter files or folder
		this.files = this.files.filter(
			file => fs.lstatSync( file ).isDirectory()
		);
	}


	/**
	 * Check if this glob is targeting existing files or folders.
	 * @returns {boolean}
	 */
	exists ()
	{
		return (this.files.length > 0);
	}

	/**
	 * Get all files or folders.
	 * @param pHandler First argument will be the file or folder path
	 */
	all ( pHandler )
	{
		return this.files.map( pHandler );
	}

	/**
	 * Delete all targeted files or folders.
	 * No warning.
	 */
	delete ()
	{
		console.log(`FileList.delete ${this.glob} ...`.yellow);

		// Browse files or folders
		this.files.map( file =>
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
		console.log(`FileList.moveTo ${this.glob} ...`.yellow);

		// Browse files or folders
		this.files.map( file =>
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
		console.log(`FileList.copyTo ${this.glob} ...`.yellow);

		// Browse files or folders
		this.files.map( file =>
		{
			// Get file name and compute destination file name
			const fileName = path.basename( file );
			const destination = path.join(pDest, fileName);

			// Copy
			fse.copySync( file, destination );
			console.log( `	${file} copied to ${destination}`.grey );
		});
	}

	read (pEncoding = 'utf-8')
	{
		// Read file from disk
		return fs.readFileSync( this.glob, { encoding: pEncoding } );
	}

	write (pContent = '', pEncoding = 'utf-8')
	{
		// Create parent folders recursively
		fse.ensureDirSync( path.dirname( this.glob ) );

		// Write file to disk
		fs.writeFileSync( this.glob, pContent, { encoding: pEncoding } );
	}

	createFolders ()
	{
		fse.ensureDirSync( this.glob );
	}

	alter ( pHandler )
	{
		this.write(
			pHandler(
				this.read()
			)
		);
	}
}

/**
 * Shortcut to create a FileList of existing files from a glob.
 */
const Files = pGlob => new FileList(pGlob, true, false);

/**
 * Shortcut to create a FileList of one not yet existing file.
 */
const NewFile = pGlob => new FileList(pGlob, false, false);

/**
 * Shortcut to create a FileList of existing folders from a glob.
 */
const Folders = pGlob => new FileList(pGlob, false, true);

/**
 * Exports public API
 */
module.exports = { FileList, Files, Folders, NewFile };