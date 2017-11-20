import React from 'react';
import {CircleChart} from '../lib/index.js';
// console.log(xx);
// const {CircleChart} = xx;
export default class Chart extends React.Component {


	render() {
		return (
			<div>
				<CircleChart value={100} animationTime={500} colors={['#B78BEE', '#1790DC']} title="使用率(%)"/>
			</div>
		);
	}
}