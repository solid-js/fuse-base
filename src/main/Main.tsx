import './Main.less';
import {App} from "solidify-lib/core/App";
import {Router} from "solidify-lib/navigation/Router";
import {GlobalConfig} from "../_common/data/GlobalConfig";

export class Main extends App
{
	// ------------------------------------------------------------------------- SINGLETON

	// Main app instance reference
	protected static __instance	:Main;

	/**
	 * Get Main app instance
	 */
	static get instance ():Main
	{
		return Main.__instance;
	}


	// ------------------------------------------------------------------------- INIT

	/**
	 * Prepare app
	 */
	protected prepare ()
	{
		// Register app instance as singleton
		Main.__instance = this;
	}

	/**
	 * Init configuration.
	 */
	protected initConfig ()
	{
		// Init specific GlobalConfig here
		//GlobalConfig.instance.inject( ... );
	}


	// ------------------------------------------------------------------------- ROUTES

	/**
	 * Init routes system
	 */
	protected initRoutes ():void
	{
		// Init router
		// Google analytics is automatically called when page is chaning
		Router.init(
			GlobalConfig.instance.base,
			[
				// -- Home page
				{
					url		: '/',
					// TODO : Full path here
					page	: 'HomePage'
				},

				// -- Product pages
				{
					url		: '/products/',
					page	: 'ProductPage',
					action	: 'overview'
				},
				{
					url		: '/products/{id}.html',
					page	: 'ProductPage',
					action	: 'product'
				}
			]
		);

		// Enable auto link listening
		Router.listenLinks();
	}


	// ------------------------------------------------------------------------- APP VIEW

	// App view instance
	//protected _appView		:AppView;
	//get appView ():AppView { return this._appView; }

	/**
	 * Init app view.
	 */
	protected initAppView ():void
	{
		// REACT
		// TODO : ROOT
		//this._appView = ReactDom.render( <AppView />, this._parameters.root[0] ) as AppView;

		// ZEPTO
		// TODO : ROOT
		//this._appView = new AppView( this._parameters.root );

		// Register mainStack
		// TODO : STACK IN REACT
		// This stack will receive NotFoundPage if no matching route is found
		//Router.registerStack('main', stackInstance);
	}


	// ------------------------------------------------------------------------- READY

	/**
	 * When everything is ready
	 */
	protected ready ()
	{
		// Start router when ready
		Router.start();
	}
}