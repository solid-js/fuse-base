
import * as React from "react";
import * as ReactDOM from "react-dom";

import {TestComponent} from "./components/testComponent/TestComponent";
import {StringUtils} from "solidify-lib/utils/StringUtils";
import {App} from "solidify-lib/core/App";
import {Router} from "solidify-lib/navigation/Router";
import {GlobalConfig} from "./data/GlobalConfig";

//import {setStatefulModules} from 'fuse-box/modules/fuse-hmr';

// TODO : Sûr ?
declare let __appConfig:any;


export class Main extends App
{
	// ------------------------------------------------------------------------- SINGLETON

	// Main app instance reference
	protected static __instance:Main;

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
		// TODO : DOC
		GlobalConfig.instance.inject( __appConfig );

		// TODO : DOC
		GlobalConfig.instance.inject({
			version: process.env['VERSION']
		});
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

			// TODO : PROPER BASE
			//this._parameters.base,
			'',
			[
				// -- Home page
				{
					url		: '/',
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

		// Register mainStack
		// This stack will receive NotFoundPage if no matching route is found
		//router.registerStack('main', stackInstance);
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
	}


	// ------------------------------------------------------------------------- READY

	/**
	 * When everything is ready
	 */
	protected ready ()
	{
		// Start router when ready
		Router.start();

		// TODO REMOVE
		this.testReact();
		this.testAsyncImport();
		this.testStateful();

		// FIXME : remove this on your app
		//this.bitmapUtilsTest();
		//this.responsiveManagerTest();
		//this.easeTest();
		//this.scrollLockTest();
	}





	// ------------------------------------------------------------------------- TODO REMOVE


	testReact ()
	{
		ReactDOM.render(
			<TestComponent />,
			document.getElementById('AppContainer')
		);
	}

	async testAsyncImport ()
	{
		console.log('Loading splitted code ... ');

		let target = await import('./async/customerArea/pages/testPage/TestPage');

		console.log( 'Loaded ! ', target );
	}

	protected testStateful ()
	{
		// TODO
		// https://medium.com/@basarat/rethinking-hot-module-reloading-58ce15b5f496
		/*
		console.log('setStatefulModules');
		setStatefulModules(name =>
		{
			console.log('> '+name);
			return true;//!/TestComponent/.test(name);
		});
		*/
	}
}