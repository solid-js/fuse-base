import {App} from "solidify-lib/core/App";
import {Router} from "solidify-lib/navigation/Router";
import {GlobalConfig} from "../_common/data/GlobalConfig";
import {AppView} from "./components/appView/AppView";
import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import {EnvUtils} from "solidify-lib/utils/EnvUtils";
import * as React from "react";
import * as ReactDOM from "react-dom";

// App bundle name on local module scope
let appBundleName:string;


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
	constructor ( pParams:any = null )
	{
		// Inject params into config
		GlobalConfig.instance.inject( pParams );

		// Get app bundle name now it's loaded
		appBundleName = require('./index').name;

		// Register init of this app bundle and get init count to avoid HMR
		SolidBundles.registerAppBundleInit( appBundleName );

		// Relay construction
		super(
			// Do not launch init sequence if this is an HMR trigger
			SolidBundles.getAppBundleInitCount( appBundleName ) == 0,
			pParams
		);
	}

	/**
	 * Prepare app.
	 */
	protected prepare (pParams:any = null)
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

	/**
	 * Init env dependent stuff.
	 */
	protected initEnv ():void
	{
		// Will add env detection classes helpers to the body.
		EnvUtils.addClasses();
	}


	// ------------------------------------------------------------------------- ROUTES

	/**
	 * Init routes system
	 */
	protected initRoutes ():void
	{
		let routes = [
			{
				url			: '/',
				page		: 'HomePage',
				async		: false,
			},
			{
				url			: '/products.html',
				page		: 'ProductOverviewPage',
				async		: true,
			},
			{
				url			: '/product-{#id}-{slug}.html',
				page		: 'ProductDetailPage',
				async		: true,
			}
		];

		const pageImporters = require('./pages');

		// Init router
		// Google analytics is automatically called when page is changing
		Router.init(
			GlobalConfig.instance.base,
			routes.map( (route:any) =>
			{
				pageImporters.map( pageImporter =>
				{
					if (pageImporter.page == route.page)
					{
						route.importer = pageImporter.importer;
					}
				});

				delete route.async;

				return route;
			})
			/*
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
					//importer 	: () => require('./pages/productOverviewPage/ProductOverviewPage')

					// Use import to load asynchronously
					importer 	: () => import('./pages/productOverviewPage/ProductOverviewPage')
				},
				{
					// Prepend parameter with a # to force it as a numeric value
					url			: '/product-{#id}-{slug}.html',
					page		: 'ProductDetailPage',

					// Use require to load synchronously
					//importer 	: () => require('./pages/productDetailPage/ProductDetailPage')

					// Use import to load asynchronously
					importer 	: () => import('./pages/productDetailPage/ProductDetailPage')
				}
			]
			*/
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