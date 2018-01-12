import "./ProductDetailPage.less";
import * as React from "react";
import {ReactPage, ReactPageProps} from "solidify-lib/react/ReactPage";

// ----------------------------------------------------------------------------- STRUCT

interface States
{

}


export class ProductDetailPage extends ReactPage<ReactPageProps, States>
{
	// ------------------------------------------------------------------------- INIT

	prepare ()
	{

	}


	// ------------------------------------------------------------------------- RENDERING

	render ()
	{
		return <div className="ProductDetailPage" ref="root">
			<h1>Product slug "{this.props.parameters.slug}"</h1>
			<h5>Product id "{this.props.parameters.id}"</h5>
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

		console.log(this.props.parameters);
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
export default ProductDetailPage;