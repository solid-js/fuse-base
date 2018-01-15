

/**
 * Add your custom properties here
 */
export class GlobalConfigProperties
{
	// Compiled version of the app, from package.json
	version		:string;

	// Root node where the app DOM will be append
	root		:Element;

	// Base http path to access to the app
	base		:string;

	// Locale translation code
	locale		:string;

	// Compiled atoms from LESS
	atoms		:{[index:string] : string};

	/**
	 * YOUR PROPERTIES HERE
	 */
}

/**
 * Singleton Config class.
 * Do not touch.
 */
export class GlobalConfig extends GlobalConfigProperties
{
	// ------------------------------------------------------------------------- SINGLETON

	// Singleton
	protected static __instance:GlobalConfig;

	/**
	 * Get GlobalConfig singleton instance.
	 */
	static get instance ()
	{
		// Create instance
		if (GlobalConfig.__instance == null)
		{
			GlobalConfig.__instance = new GlobalConfig();
		}

		// Return singleton instance
		return GlobalConfig.__instance;
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