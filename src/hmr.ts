/**
 * This file is only loaded in Dev mode.
 * It manage how the Hot Module Reloading behave.
 *
 * IMPORTANT : Do not import or require this file.
 * IMPORTANT : It has to be removed from bundles on production.
 * IMPORTANT : See instructions bellow to use it correctly.
 *
 * ---- If you want your state to persist between reloads (tabs on a component for example)
 *
 * If you want to add a Component as a Stateful component, to avoid it to be
 * refreshed each time an other component is changed ?
 * Add this on the bottom of the file :
 *
 * if (process.env.NODE_ENV !== 'production') window['__HMR'].registerStatefulComponent( $ExportedFileClass );
 *
 *
 * ---- If you want everything to reload when changing a file (Three.js app for example)
 *
 * If you want a component to reload the entire page each time it is updated ?
 * Add this on the first level of the file :
 *
 * if (process.env.NODE_ENV !== 'production') window['__HMR'].registerReloadPath( __filename );
 *
 *
 * If you want all files inside a folder to reload the page when updated ?
 * Add this on the first level of a loaded file inside this folder :
 *
 * if (process.env.NODE_ENV !== 'production') window['__HMR'].registerReloadPath( __dirname );
 */

// Get FuseBox object for typecript
const FuseBox = window['FuseBox'];


export class HMR
{
	// Window key of this singleton
	static WINDOW_KEY = '__HMR';

	// Stored stateful components states to keep them between reloadings
	protected _statefulComponentsStates 					= [];

	// Stored path of files which trigger a full page reload
	protected _reloadPaths					:string[] 		= [];


	/**
	 * Constructor
	 */
	constructor ()
	{
		// Add this as a FuseBox plugin
		FuseBox.addPlugin( this );
	}

	/**
	 * FuseBox triggers an HMR update
	 */
	hmrUpdate ({ type, path, content, dependants })
	{
		// Check if this file needs a full page reload
		const filteredReloadPath = this._reloadPaths.filter(
			reloadPath => path.indexOf(reloadPath) === 0
		);

		// If this file needs a full page reload
		if ( filteredReloadPath.length > 0 )
		{
			// Wait a bit, because, you know...
			setTimeout(() => location.reload( true ), 500);
			return true;
		}

		// If this is a CSS file
		if ( type === 'css')
		{
			// Refresh whole frame if this file is not in the default package
			if ( !FuseBox.exists( path ) && !FuseBox.exists( 'default/' + path ) ) return false;

			// Replace new CSS file in memory
			FuseBox.flush( name => (name === path) );
			FuseBox.dynamic( path, content );

			// Re-inject this CSS file without reloading JS
			// Always refresh from default package
			FuseBox.import( 'default/' + path );
			return true;
		}

		// If this is an hosted css file, we'll need to replace link tag
		// IMPORTANT : We advise to use solid-fuse.config.js > generateCSSFiles = 'quantum' or false
		else if ( type === 'hosted-css' )
		{
			// Target all tags
			const linkTags = document.getElementsByTagName('link');
			for (let i=0; i < linkTags.length; i++)
			{
				// Target this tag
				let currentLinkTag = linkTags[i] as HTMLLinkElement;

				// Keep only stylesheet tags
				if (currentLinkTag.getAttribute('rel').toLowerCase() !== 'stylesheet') continue;

				// Get href and remove question mark
				let linkHref = currentLinkTag.getAttribute('href');
				if (linkHref.indexOf('?') > -1)
				{
					linkHref = linkHref.split('?')[0];
				}

				// If this link style is pointing to a file looking like the modified hosted css file
				if (linkHref.indexOf(path) == linkHref.length - path.length)
				{
					// Remove link tag from dom
					const parent = currentLinkTag.parentElement;

					// Add re-add it to reload it
					currentLinkTag.remove();
					window.setTimeout(() =>
					{
						parent.appendChild( currentLinkTag )
					}, 1);
				}
			}
			return true;
		}

		// No reload
		return false;
	}

	/**
	 * Register a Stateful Component.
	 * Will keep state when changing and re-inject state when reloading.
	 * Only works for components that are only once in DOM.
	 * @param pComponentClass Class of the stateful component
	 */
	registerStatefulComponent (pComponentClass:any)
	{
		// Get component name
		const componentName = pComponentClass.prototype.constructor.name;

		// Show we have registered it as stateful component
		if ( !(componentName in this._statefulComponentsStates) )
		{
			console.info(`%cRegistered stateful component for HMR ${componentName}`, 'color: #237abe');
		}

		// Proxy prepare and componentDidUpdate methods
		const originalPrepare = pComponentClass.prototype.prepare;
		const originalUpdate = pComponentClass.prototype.componentDidUpdate;

		// Target this as _hmr to keep scope
		const _hmr = this;

		// Override prepare method
		pComponentClass.prototype.prepare = function ()
		{
			// Relay prepare phase and register prepared state
			originalPrepare && originalPrepare.call( this );

			// If we already have a registered state
			if ( componentName in _hmr._statefulComponentsStates )
			{
				// Inject new state after prepare
				this.state = _hmr._statefulComponentsStates[ componentName ];
			}
			else
			{
				_hmr._statefulComponentsStates[ componentName ] = this.state;
			}
		};

		// Override componentDidUpdate method
		pComponentClass.prototype.componentDidUpdate = function (...rest)
		{
			// Relay method
			originalUpdate && originalUpdate.call(this, ...rest);

			// Store udpated state
			_hmr._statefulComponentsStates[ componentName ] = this.state;
		};
	}

	/**
	 * Register a path of full page reload.
	 * When a file starting with this path will be updated, a full page reload will trigger.
	 * @param pReloadPath Path of the file or folder to trigger full page reload when updated.
	 */
	registerReloadPath ( pReloadPath )
	{
		this._reloadPaths.push( pReloadPath );
	}
}

// Déclare HMR object once, as singleton, stored in window
if ( !(HMR.WINDOW_KEY in window) )
{
	window[ HMR.WINDOW_KEY ] = new HMR();
}