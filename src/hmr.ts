
// Get FuseBox object for typecript
const FuseBox = window['FuseBox'];



export class HMR
{
	// Window key of this singleton
	static WINDOW_KEY = '__HMRState';

	// Stored stateful components states to keep them between reloadings
	protected _statefulComponentsStates = [];

	/**
	 * Constructor
	 */
	constructor ()
	{
		// Store as singleton
		window[ HMR.WINDOW_KEY ] = this;

		// Add this as a FuseBox plugin
		FuseBox.addPlugin( this );
	}

	/**
	 * FuseBox triggers an HMR update
	 */
	hmrUpdate ({ type, path, content, dependants })
	{
		// If this is a CSS file
		if ( type === 'css' )
		{
			if ( !FuseBox.exists( path ) ) return true;

			// Replace new CSS file in memory
			FuseBox.flush( name => (name === path) );
			FuseBox.dynamic( path, content );

			// Re-inject this CSS file without reloading JS
			FuseBox.import( path );
			return true;
		}

		// No reload
		else return false;
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
}

// Déclare HMR object once, as singleton
if ( !(HMR.WINDOW_KEY in window) ) new HMR();