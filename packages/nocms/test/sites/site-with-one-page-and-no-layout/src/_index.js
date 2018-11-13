import React, { Component } from 'react';
import { render } from 'react-dom';

class Counter extends Component {
	constructor() {
		super();

		this.state = {
			count: 0
		};
	}
	render() {
		const { count } = this.state;
		return (<button onclick={() => this.setState({ count: count + 1})}>{count}</button>);
	}
}

render((<Counter />), document.querySelectorAll('#foo1'));
render((<Counter />), document.querySelector('#foo2'));