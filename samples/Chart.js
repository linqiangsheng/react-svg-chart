import React from 'react';
import {CircleChart, EasiCircleChart, DashboardCircleChart} from '../src/index.js';

export default class Chart extends React.Component {

// '#FF003A', '#FFA150'
// '#1790DC', '#B78BEE'
// '#00D561', '#FFD71E', '#ffb05b', '#FFA86D', '#F6502F'
	render() {
		return (
			<div style={{width: '180px', height: '180px'}}>
				<EasiCircleChart value={80.} animationTime={500}
					max={100}
					colors={['#00D561', '#FFD71E',  '#FFA86D', '#F6502F']} title="使用率(%)"/>
				<DashboardCircleChart value={340} animationTime={500}
					max={500}
					isScaleVisible={true}
					title="重度污染"
					colors={['#00D561', '#FFD71E', '#ffaf52', '#fb9a29', '#F6502F']}/>
			</div>
		);
	}
}