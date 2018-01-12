import "AppView.less";
import * as React from "react";
import {ReactView} from "solidify-lib/react/ReactView";

// ----------------------------------------------------------------------------- STRUCT

export interface Props
{

}

export interface States
{

}


export class AppView extends ReactView<Props, States>
{
	// ------------------------------------------------------------------------- INIT

	prepare ()
	{

	}


	// ------------------------------------------------------------------------- RENDERING

	render ()
	{
		return <div className="AppView" ref="root">
			AppView
		</div>
	}


	// ------------------------------------------------------------------------- LIFECYCLE

	componentDidMount ()
	{
		console.log('MOUNT 17');
	}

	componentDidUpdate (pPrevProps:Props, pPrevState:States)
	{

	}


	// ------------------------------------------------------------------------- HANDLERS


	// ------------------------------------------------------------------------- STATES


}