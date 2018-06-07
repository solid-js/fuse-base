const spawn = require('child_process').spawn;
const os = require('os');

// AIFF sounds directory on MacOS
const soundDirectory = '/System/Library/Sounds/';

// If we can play sound (only MacOS for now)
const canPlaySounds = (os.platform().toLowerCase() === 'darwin');

/**
 * Public Scope
 */
module.exports = {
	/**
	 * Play a notification sound.
	 * Only works on MacOS for now. Will ignore for any other system.
	 * @param pSound Name of the sound to play, without extension, into Sounds MacOS directory.
	 */
	playSound : (pSound) =>
	{
		if (!canPlaySounds) return;

		spawn('afplay', [`${soundDirectory}${pSound}.aiff`]);
	}
}