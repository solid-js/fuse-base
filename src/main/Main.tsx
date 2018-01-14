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

		// Register init of this app bundle and get init count to avoid HMR
		const initCount = SolidBundles.registerAppBundleInit( require('./index').name );

		// Relay construction
		// Do not launch init sequence if this is an HMR trigger
		super( initCount == 0 );
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
					url			: '/',
					page		: 'HomePage',

					// Use require to load synchronously
					importer 	: () => require('./pages/homePage/HomePage')

					// Use import to load asynchronously
					//importer 	: () => import('./pages/homePage/HomePage')
				},

				// -- Product pages
				{
					url			: '/products.html',
					page		: 'ProductOverviewPage',

					// Use require to load synchronously
					importer 	: () => require('./pages/productOverviewPage/ProductOverviewPage')

					// Use import to load asynchronously
					//importer 	: () => import('./pages/homePage/HomePage')
				},
				{
					// Prepend parameter with a # to force it as a numeric value
					url			: '/product-{#id}-{slug}.html',
					page		: 'ProductDetailPage',

					// Use require to load synchronously
					importer 	: () => require('./pages/productDetailPage/ProductDetailPage')

					// Use import to load asynchronously
					//importer 	: () => import('./pages/homePage/HomePage')
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

		// Start router
		Router.start();
	}
}