import React from 'react';
import {CircleChart, EasiCircleChart, DashboardCircleChart} from '../src/index.js';

export default class Chart extends React.Component {

// '#FF003A', '#FFA150'
// '#1790DC', '#B78BEE'
	render() {
		return (
			<div style={{width: '180px', height: '180px'}}>
				<EasiCircleChart value={60.2} animationTime={500}
					max={100}
					colors={['#00D561']} title="使用率(%)"/>
			</div>
		);
	}
}