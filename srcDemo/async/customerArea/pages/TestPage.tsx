import * as React from 'react';


import 'TestPage.less';

export interface Props
{

}

export interface States
{
	//counter		:number;
}

export class TestPage extends React.Component<Props, States>
{
	constructor (props:Props, context:any)
	{
		// Relay construction
		super(props, context);

		// Prepare component
		this.prepare();
	}

	/**
	 * Prepare component before init
	 */
	protected prepare ()
	{
		this.state = {};
	}

	componentDidMount ()
	{
	}

	componentWillUnmount ()
	{
	}

	render ()
	{
		return <div className="TestPage">
			<h3 className="TestPage_pageElement">Test Page !</h3>
		</div>
	}

}