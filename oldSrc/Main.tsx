
// IMPORTANT : Load common less files first
import "Main.less";

import * as React from "react";
import * as ReactDOM from "react-dom";

import {StringUtils} from 'solidify-lib/utils/StringUtils';

import {TestComponent} from "./components/testComponent/TestComponent";

import {setStatefulModules} from 'fuse-box/modules/fuse-hmr';


import {} from 'fuse-box/'

interface IAppConfig
{
	base: string;
	param1: number;
}

declare let __appConfig:IAppConfig;

export class Main
{
	constructor ()
	{
		console.log( __appConfig );

		let solidTest = StringUtils.nl2br(`
			Je vais
			à la ligne
		`);

		console.log(solidTest);

		this.testReact();

		this.testAsyncImport();

		this.testStateful();
	}

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

new Main();