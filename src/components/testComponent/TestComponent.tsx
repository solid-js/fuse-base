import 'TestComponent.less';

import * as React from 'react';
import {StringUtils} from "solidify-lib/utils/StringUtils";

import TweenLite = gsap.TweenLite;
import Power3 = gsap.Power3;


//import 'gsap/src/uncompressed/TweenLite';


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

	protected _root:HTMLDivElement;

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

		console.log('ZEPTO TEST');

		let $zeptest = $('.TestComponent');

		console.log($zeptest);

		$zeptest.on('click', (event:Event) =>
		{
			console.log('Zepto click', event);
			return true;
		});

		$zeptest.parents('*').each((i, el) =>
		{
			console.log('Zepto parent', i, el);
			return true;
		});

		$zeptest.data('test', JSON.stringify({key: 'value'}));

		console.log('Zepto data', $zeptest.data('test'));

		$.ajax({
			url: '?',
			xhrFields: {
				withCredentials: true
			},
			//crossDomain: true,
			success: (data) =>
			{
				console.log('Zepto ajax', data.length);
			}
		});

		console.log('Zepto find : ', $zeptest.find('.TestComponent_element')[0]);

		$( () =>
		{
			console.log('Zepto document ready');
		});

		let $test:ZeptoCollection = $('.test');
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

	componentDidUpdate ()
	{
		/*
		TweenLite.to(this._root, 1 / 2, {
			x: 10,
			ease: Power3.easeInOut
		});
		TweenLite.to(this._root, 1 / 2, {
			x: 0,
			delay: 1 / 2,
			ease: Power3.easeInOut
		});
		*/
	}

	render ()
	{
		return <div className="TestComponent" ref={r => this._root = r}>
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