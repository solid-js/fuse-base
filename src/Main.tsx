
import * as React from "react";
import * as ReactDOM from "react-dom";

import {TestComponent} from "./components/testComponent/TestComponent";
import {StringUtils} from "solidify-lib/utils/StringUtils";


//import {setStatefulModules} from 'fuse-box/modules/fuse-hmr';

interface IAppConfig
{
	base: string;
	param1: number;
}

declare let __appConfig:IAppConfig;

export class Main
{
	protected static __instance:Main;

	static get instance ():Main
	{
		return Main.__instance;
	}



	constructor ()
	{
		Main.__instance = this;

		//this.prout = 'ok';
		console.log( __appConfig );

		let solidTest = StringUtils.nl2br(`
			Je vais
			à la ligne
		`);

		console.log(solidTest);

		this.testReact();

		this.testAsyncImport();

		this.testStateful();

		// TODO
		console.log('VERSION', process.env['VERSION'] );
	}

	testReact ()
	{
		ReactDOM.render(
			<TestComponent />,
			document.getElementById('AppContainer')
		);
	}

	testAsyncImport ()
	{
		console.log('Loading splitted code ... ');

		//let target = await import('./async/customerArea/pages/testPage/TestPage');

		let pPageName = './async/customerArea/pages/testPage/TestPage';


		import(pPageName)
		.catch( (error) =>
		{
			console.log('CATCH', error);

		}).then( (success) =>
		{
			console.log('THEN', success);
		});

		//console.log( 'Loaded ! ', target );
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