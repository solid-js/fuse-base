import "./HomePage.less";
import * as React from "react";
import {ReactPage, ReactPageProps} from "solidify-lib/react/ReactPage";
import {Router} from "solidify-lib/navigation/Router";

// ----------------------------------------------------------------------------- STRUCT

interface States
{

}


export class HomePage extends ReactPage<ReactPageProps, States>
{
	// ------------------------------------------------------------------------- INIT

	prepare ()
	{

	}


	// ------------------------------------------------------------------------- RENDERING

	render ()
	{
		return <div className="HomePage" ref="root">

			<h1>HomePage</h1>
			<ul>
				<li>
					<a
						href={Router.generateURL({
							page: 'ProductOverviewPage'
						})}
						data-internal-link
					>Products overview</a>
				</li>
				<li>
					<a
						href={Router.generateURL({
							page: 'ProductDetailPage',
							parameters: {
								id: 5,
								slug: 'my-product'
							}
						})}
						data-internal-link
					>Product detail</a>
				</li>
			</ul>
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
export default HomePage;