
// ----------------------------------------------------------------------------- PROXIES AND DIRTY STUFF


/**
 * Remove huge file list from console
 */
patchFileLogs = () =>
{
	// Proxy the file list for each bundles from the Log class
	const LogClass = require('fuse-box/Log').Log;
	const originalEchoDefaultCollection = LogClass.prototype.echoDefaultCollection;
	LogClass.prototype.echoDefaultCollection = function ()
	{
		// Do not show files list
		this.showBundledFiles = false;

		// Relay
		originalEchoDefaultCollection.apply(this, arguments);
	}
}

/**
 * Remove useless .less.js warnings from console
 */
patchUselessWarnings = () =>
{
	// Proxy addWarning method to remove less.js warnings from BundleProducer
	const BundleProducerClass = require('fuse-box/core/BundleProducer').BundleProducer
	const originalAddWarning = BundleProducerClass.prototype.addWarning
	BundleProducerClass.prototype.addWarning = function (key, message)
	{
		// Bonus, show a loader since working on files
		const spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
		this._warningCounter = (this._warningCounter || 0) + 1;
		const spinnerChar = spinner.charAt( this._warningCounter % spinner.length );
		process.stdout.write(`  ${spinnerChar}\r`);

		// Remove .less.js files, those warnings are useless
		if ( /\.less\.js/.test(message) ) return;

		// Relay method to original
		originalAddWarning.apply(this, arguments);
	};

}


// ----------------------------------------------------------------------------- PUBLIC SCOPE

/**
 * Public API
 */
module.exports = {

	/**
	 * Init solid overrides
	 */
	init : () =>
	{
		patchFileLogs();
		patchUselessWarnings();
	}
};