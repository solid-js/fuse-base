import 'TestComponent.less';

import * as React from 'react';
import {StringUtils} from "solidify-lib/utils/StringUtils";


export interface Props
{

}

export interface States
{
	counter		:number;
}

export class TestComponent extends React.Component<Props, States>
{
	protected _counterInterval:number;

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
		this.state = {
			counter: 0
		};
	}

	componentDidMount ()
	{
		this.startCounter();
	}

	componentWillUnmount ()
	{
		window.clearInterval( this._counterInterval );
	}

	startCounter ()
	{
		this._counterInterval = window.setInterval(this.incrementCounter.bind(this), 1000);
	}

	incrementCounter ()
	{
		this.setState({
			counter: this.state.counter + 1
		});
	}

	render ()
	{
		return <div className="TestComponent">
			<h3>I'm a test 51</h3>
			<ul className="TestComponent_element">
				<li key={0}>0</li>
				<li key={1}>1</li>
				<li key={2}>2</li>
				<li key={3}>3</li>
				<li key={4}>4</li>
				<li key={5}>5</li>
				<li key={6}>6</li>
			</ul>
			<h4>{StringUtils.slugify('héhé ho àç"!\'(àçé(çà!è@é"\'"))')}</h4>
			<div>
				On compte : {this.state.counter} super ça et ouai !
			</div>
		</div>
	}
}