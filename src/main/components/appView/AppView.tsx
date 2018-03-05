import "AppView.less";
import * as React from "react";
import {ReactView} from "solidify-lib/react/ReactView";
import {
	ETransitionType,
	ReactViewStack
} from "solidify-lib/react/ReactViewStack";
import {IPage} from "solidify-lib/navigation/IPage";
import {Router} from "solidify-lib/navigation/Router";

// ----------------------------------------------------------------------------- STRUCT

export interface Props
{

}

export interface States
{

}


export class AppView extends ReactView<Props, States>
{
	protected _viewStack	:ReactViewStack;

	// ------------------------------------------------------------------------- INIT

	prepare ()
	{

	}


	// ------------------------------------------------------------------------- RENDERING

	render ()
	{
		return <div className="AppView" ref="root">
			<ReactViewStack
				ref={ r => this._viewStack = r }
				transitionControl={ this.transitionControl.bind(this) }
				onNotFound={ this.pageNotFoundHandler.bind(this) }
				transitionType={ ETransitionType.PAGE_SEQUENTIAL }
			/>
		</div>
	}


	// ------------------------------------------------------------------------- LIFECYCLE

	componentDidMount ()
	{
		Router.registerStack('main', this._viewStack);

		Router.onNotFound.add(this.pageNotFoundHandler, this);
	}

	componentDidUpdate (pPrevProps:Props, pPrevState:States)
	{

	}


	// ------------------------------------------------------------------------- HANDLERS


	protected transitionControl ($oldPage:HTMLElement, $newPage:HTMLElement, pOldPage:IPage, pNewPage:IPage) : Promise<any>
	{
		console.log('transitionControl');

		return new Promise( resolve => {

		});
	}

	protected routeNotFoundHandler (...rest)
	{
		console.log('ROUTE NOT FOUND', rest);
	}

	protected pageNotFoundHandler (pPageName:string)
	{
		console.log('PAGE NOT FOUND', pPageName);
	}

	// ------------------------------------------------------------------------- STATES


}