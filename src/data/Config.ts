

/**
 * Add your custom properties here
 */
export class ConfigProperties
{
	// Root node where the app DOM will be append
	root		:Element;

	// Base http path to access to the app
	base		:string;

	// Locale translation code
	locale		:string;

	/**
	 * YOUR PROPERTIES HERE
	 */
}

/**
 * Singleton Config class.
 * Do not touch.
 */
export class Config extends ConfigProperties
{
	// ------------------------------------------------------------------------- SINGLETON

	// Singleton
	protected static __instance:Config;

	/**
	 * Get Config singleton instance.
	 */
	static get instance ()
	{
		// Create instance
		if (Config.__instance == null)
		{
			Config.__instance = new Config();
		}

		// Return singleton instance
		return Config.__instance;
	}


	// ------------------------------------------------------------------------- INJECT

	/**
	 * Inject arbitrary properties inside this object.
	 */
	inject (pProps:any)
	{
		for (let i in pProps)
		{
			this[i] = pProps[i];
		}
	}
}