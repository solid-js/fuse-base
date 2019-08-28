import { createElement } from "react";
const React = { createElement };
import { render } from "react-dom";
import {App} from "solidify-lib/core/App";
import {Router} from "solidify-lib/navigation/Router";
import {GlobalConfig} from "../_common/data/GlobalConfig";
import {AppView} from "./components/appView/AppView";
import {SolidBundles} from "solidify-lib/helpers/SolidBundles";
import {EnvUtils} from "solidify-lib/utils/EnvUtils";

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
		// Add version log in console
		console.log(`%c version: ${GlobalConfig.instance.version} `, 'background: #222; color: #bada55');

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
		// Add generated pages dependencies file to dynamic page import.
		// This will allow us to target pages by their names without explicit import.
		// Only use if you don't specify importers in Router.init
		Router.addDynamicPageImporters( require('./pages') );

		// Init router
		// Google analytics is automatically called when page is changing
		Router.init(
			GlobalConfig.instance.base,
			[
				// -- Home page
				{
					url			: '/',
					page		: 'HomePage',


					// -- If you do not want to use dynamic importers :
					// Use require to load synchronously
					//importer 	: () => require('./pages/homePage/HomePage')
					// Use import to load asynchronously
					//importer 	: () => import('./pages/homePage/HomePage')
				},

				// -- Product pages
				{
					url			: '/products.html',
					page		: 'ProductOverviewPage',


					// -- If you do not want to use dynamic importers :
					// Use require to load synchronously
					//importer 	: () => require('./pages/productOverviewPage/ProductOverviewPage')
					// Use import to load asynchronously
					//importer 	: () => import('./pages/productOverviewPage/ProductOverviewPage')
				},
				{
					// Prepend parameter with a # to force it as a numeric value
					url			: '/product-{#id}-{slug}.html',
					page		: 'ProductDetailPage',

					// -- If you do not want to use dynamic importers :
					// Use require to load synchronously
					//importer 	: () => require('./pages/productDetailPage/ProductDetailPage')
					// Use import to load asynchronously
					//importer 	: () => import('./pages/productDetailPage/ProductDetailPage')
				}
			]
		);

		// Enable auto link listening
		Router.listenLinks();
	}


	// ------------------------------------------------------------------------- READY

	/**
	 * When everything is ready
	 */
	protected ready ()
	{
		// React app view
		render(<AppView />, GlobalConfig.instance.root);

	}
}
