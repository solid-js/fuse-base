import "./ProductOverviewPage.less";
import * as React from "react";
import {ReactPage, ReactPageProps} from "solidify-lib/react/ReactPage";

// ----------------------------------------------------------------------------- STRUCT

interface States
{

}


export class ProductOverviewPage extends ReactPage<ReactPageProps, States>
{
	// ------------------------------------------------------------------------- INIT

	prepare ()
	{

	}


	// ------------------------------------------------------------------------- RENDERING

	render ()
	{
		return <div className="ProductOverviewPage" ref="root">
			ProductOverviewPage
		</div>
	}


	// ------------------------------------------------------------------------- PAGE

	/**
	 * Action on this page.
	 * Check props.action and props.parameters to show proper content.
	 */
	action ()
	{
	    // Remove if not used
	}

	/**
	 * Play in animation.
	 * Have to return a promise when animation is ended.
	 */
	playIn ():Promise<any>
	{
		return new Promise( resolve =>
		{
			resolve();
		});
	}

	/**
	 * Play out animation.
	 * Have to return a promise when animation is ended.
	 */
	playOut ():Promise<any>
	{
		return new Promise( resolve =>
		{
			resolve();
		});
	}
}

// Also export as default
export default ProductOverviewPage;