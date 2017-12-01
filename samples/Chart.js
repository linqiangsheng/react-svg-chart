import React from 'react';
import {CircleChart} from '../src/index.js';

export default class Chart extends React.Component {

// '#FF003A', '#FFA150'
// '#1790DC', '#B78BEE'
	render() {
		return (
			<div style={{width: '300px', height: '300px'}}>
				<CircleChart value={5} animationTime={500} colors={['#FF003A', '#FFA150']} title="使用率(%)"/>
			</div>
		);
	}
}