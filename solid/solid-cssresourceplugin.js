/**
 * This file is a patched version of fuse's CSSResourcePlugin.
 *
 * It copy resource files synchronously so we do not have this error anymore :
 * https://github.com/fuse-box/fuse-box/issues/1060
 *
 * And also add this option :
 * https://github.com/fuse-box/fuse-box/issues/1282
 */

const { ensureDir, joinFuseBoxPath } = require('fuse-box/Utils');
const path = require("path");
const { utils } = require("realm-utils");
const fs = require('fs');
const { SVG2Base64 } = require('fuse-box/lib/SVG2Base64');
const { CSSUrlParser } = require('fuse-box/lib/CSSUrlParser');

const base64Img = require("base64-img");
const IMG_CACHE = {};
let resourceFolderChecked = false;


const copyFile = (source, target) =>
{
	if (!fs.existsSync(source)) return;

	ensureDir(path.dirname(target));

	fs.copyFileSync(source, target);
};

const generateNewFileName = (str) => {
	let s = str.split("node_modules");
	const ext = path.extname(str);
	if (s[1]) {
		str = s[1];
	}
	let hash = 0;
	let i;
	let chr;
	let len;
	if (str.length === 0) { return hash.toString() + ext; }
	for (i = 0, len = str.length; i < len; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	let fname = hash.toString() + ext;
	if (fname.charAt(0) === "-") {
		fname = "_" + fname.slice(1);
	}
	return fname;
};

/**
 * @export
 * @class RawPluginClass
 */
class SolidCSSResourcePluginClass {

	constructor(opts = {}) {

		this.copiedFiles = [];
		this.files = {};

		this.test = /\.css$/;

		this.resolveFn = (p) => joinFuseBoxPath("/css-resources", p)
		this.useOriginalFilenames = false;

		if (opts.dist) {
			this.distFolder = ensureDir(opts.dist);
		}
		if (opts.inline) {
			this.inlineImages = opts.inline;
		}
		if (opts.macros) {
			this.macros = opts.macros;
		}
		if (utils.isFunction(opts.resolve)) {
			this.resolveFn = opts.resolve;
		}
		if (utils.isFunction(opts.resolveMissing)) {
			this.resolveMissingFn = opts.resolveMissing;
		}
		if (opts.useOriginalFilenames) {
			this.useOriginalFilenames = opts.useOriginalFilenames;
		}
		if (opts.filesMapping) {
			this.filesMapping = opts.filesMapping;
		}
	}

	init(context) {
		context.allowExtension(".css");
	}


	createResourceFolder(file) {
		if (resourceFolderChecked === false) {

			resourceFolderChecked = true;
			if (this.distFolder) {
				return;
			}
			// making sure dist folder exists
			this.distFolder = ensureDir(path.join(file.context.output.dir, "css-resources"));
		}
	}

	transform(file) {
		file.addStringDependency("fuse-box-css");
		file.loadContents();
		if (this.distFolder) {
			this.createResourceFolder(file);
		}

		const currentFolder = file.info.absDir;
		//const files = {};
		const tasks = [];


		const walker = (url) => {
			if (this.macros) {
				for (let key in this.macros) {
					url = url.replace('$' + key, this.macros[key])
				}
			}

			if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('//') || url.startsWith('#')) {
				return url
			}

			let urlFile = path.isAbsolute(url) ? url : path.resolve(currentFolder, url);
			urlFile = urlFile.replace(/[?\#].*$/, "");

			if (file.context.extensionOverrides && file.belongsToProject()) {
				urlFile = file.context.extensionOverrides.getPathOverride(urlFile) || urlFile;
			}

			if (this.inlineImages) {
				if (IMG_CACHE[urlFile]) {
					return IMG_CACHE[urlFile];
				}
				if (!fs.existsSync(urlFile)) {
					if (this.resolveMissingFn) {
						urlFile = this.resolveMissingFn(urlFile, this)
						if (!urlFile || !fs.existsSync(urlFile)) {
							file.context.debug("CSSResourcePlugin", `Can't find (resolved) file ${urlFile}`);
							return
						}
					}
					else {
						file.context.debug("CSSResourcePlugin", `Can't find file ${urlFile}`);
						return;
					}
				}
				const ext = path.extname(urlFile);
				let fontsExtensions = {
					".woff": "application/font-woff",
					".woff2": "application/font-woff2",
					".eot": "application/vnd.ms-fontobject",
					".ttf": "application/x-font-ttf",
					".otf": "font/opentype",
				};
				if (fontsExtensions[ext]) {
					let content = new Buffer(fs.readFileSync(urlFile)).toString("base64");
					return `data:${fontsExtensions[ext]};charset=utf-8;base64,${content}`;
				}
				if (ext === ".svg") {
					let content = SVG2Base64.get(fs.readFileSync(urlFile).toString());
					IMG_CACHE[urlFile] = content;
					return content;
				}
				let result = base64Img.base64Sync(urlFile);
				IMG_CACHE[urlFile] = result;
				return result;
			}

			// copy files
			if (this.distFolder) {
				let newFileName = this.useOriginalFilenames ? path.relative(file.context.homeDir, urlFile) : generateNewFileName(urlFile);

				if (!this.files[urlFile]) {
					let newPath = path.join(this.distFolder, newFileName);
					tasks.push(copyFile(urlFile, newPath));
					this.files[urlFile] = true;

					// We store this copied file source and destination path for the middleware
					this.copiedFiles.push({
						from: urlFile,
						to: newPath
					});

					// We also store a string which uniquely identify this array
					// To avoid watch loop
					this.copiedFilesID = this.copiedFiles.map(
						copiedFile => generateNewFileName( copiedFile.from )
					).join('+');
				}

				return this.resolveFn(newFileName);
			}
		}
		file.contents = CSSUrlParser.walk(file.contents, walker);
	}

	bundleEnd (producer)
	{
		// If there is no middleware from config, quit
		if (!this.filesMapping) return;

		// Get home dir (src path)
		const homeDir = producer.fuse.opts.homeDir;

		// We store the copied file ID and continue only if it changed
		// It allow us to avoid watch loop when fileMapping middleware is producing a source file
		if (this.previousCopiedFilesID === this.copiedFilesID) return;
		this.previousCopiedFilesID = this.copiedFilesID;

		// Call middleware with copied files path
		this.filesMapping(

			// Patch all files paths from src and dist folders
			this.copiedFiles.map( fileMapping => ({
				from: path.relative( homeDir, fileMapping.from ),
				to: path.relative( this.distFolder, fileMapping.to )
			}))

		);
	}
}

module.exports = {
	SolidCSSResourcePlugin: (options) =>
	{
		return new SolidCSSResourcePluginClass(options);
	}
}