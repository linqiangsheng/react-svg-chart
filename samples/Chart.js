import React from 'react';
import {CircleChart} from '../lib/index.js';
// console.log(xx);
// const {CircleChart} = xx;
export default class Chart extends React.Component {


	render() {
		return (
			<div style={{width: '300px', height: '300px'}}>
				<CircleChart value={2} animationTime={500} colors={['#B78BEE', '#1790DC']} title="使用率(%)"/>
			</div>
		);
	}
}