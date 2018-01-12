import {App} from "solidify-lib/core/App";
import {Router} from "solidify-lib/navigation/Router";
import {GlobalConfig} from "../_common/data/GlobalConfig";
import {AppView} from "./components/appView/AppView";
import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import * as React from "react";
import * as ReactDOM from "react-dom";

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
	 * App constructor
	 */
	constructor ( pParams )
	{
		// Inject params into config
		GlobalConfig.instance.inject( pParams );

		// Relay construction
		// Do not launch init sequence if this is an HMR trigger
		super( !SolidBundles.isHMRTrigger );
	}

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


	// ------------------------------------------------------------------------- READY

	// App view instance
	protected _appView		:AppView;
	get appView ():AppView { return this._appView; }

	/**
	 * When everything is ready
	 */
	protected ready ()
	{
		// React app view
		this._appView = ReactDOM.render(
			<AppView />,
			GlobalConfig.instance.root
		) as AppView;

		// ZEPTO
		// TODO : ROOT
		//this._appView = new AppView( this._parameters.root );

		// Register mainStack
		// TODO : STACK IN REACT
		// This stack will receive NotFoundPage if no matching route is found
		//Router.registerStack('main', stackInstance);

		// Start router
		Router.start();
	}
}