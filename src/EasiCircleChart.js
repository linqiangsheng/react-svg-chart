import React from 'react';
import { findDOMNode } from 'react-dom';
import { map, partial } from 'lodash';
import utils from '../helpers/utils.js';
import '../style/chart.less';

const ANGEL = 0, //起始角度
	VIEWBOX_SIZE = 300, //视图大小
	ARC_R = 130, //外圆弧半径
	SCALE_SIZE = 0.5, //刻度占圆环比例
	ARC_ROUND_DISTANCE = 10, //圆弧与圆环的距离
	ANNULUS_WIDTH = 0.072, //圆环默认宽度
	SVG_NS = 'http://www.w3.org/2000/svg',
	XLINK_NS = 'http://www.w3.org/1999/xlink',
	FRAME_NUMBER = 60; //假设浏览器每秒60祯


export default class EasiCircleChart extends React.Component {

	constructor(props) {
		super(props);
		this.defineLinearGradient = this.defineLinearGradient.bind(this);
		this.drawArc = this.drawArc.bind(this);
		this.move = this.move.bind(this);
		this.drawContent = this.drawContent.bind(this);

		//由于多组件复用，会导致id冲突，因此使用uuid生成唯一标示的id
		this.gradientId = utils.generateUUID();
		this.filterId = utils.generateUUID();
		this.scaleId = utils.generateUUID();
	}

	/**
	 * 定义渐变色
	 * @return {[type]} [description]
	 */
	defineLinearGradient() {
		const {
			colors = ['#B78BEE', '#1790DC']
		} = this.props;
		const percent = 100 / colors.length;
		return <linearGradient id={this.gradientId} x1="0" y1="0" x2="0" y2="1">
			{map(colors, (item, index) => {
				return <stop key={item} offset={index * percent + '%'} style={{stopColor: item}}/>
			})}
		</linearGradient>
	}

	/**
	 * 画外圆弧
	 * @return {[type]} [description]
	 */
	drawArc() {
		const {colors = ['#B78BEE', '#1790DC'], annulusWidth = ANNULUS_WIDTH} = this.props;
		const pointColor = colors[0],
			a = 0.4; //透明度
		let r = 0, g = 0, b = 0;
		if (/^#\w{6}$/.test(pointColor)) {
			r = parseInt(pointColor.substr(1, 2), 16);
			g = parseInt(pointColor.substr(3, 2), 16);
			b = parseInt(pointColor.substr(5, 2), 16);
		}
		r = r === 0 ? 0 : r / 255;
		g = g === 0 ? 0 : g / 255;
		b = b === 0 ? 0 : b / 255;
		return <g>
			<defs>
				<filter id={this.filterId} x="-1" y="-1" width="60" height="60">
					<feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
					<feColorMatrix result="matrixOut" in="offOut" type="matrix"
						values={`${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 0.4 0`}/>
					<feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2" />
					<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
			    </filter>
			</defs>
			<path ref="arc"
				stroke={`url(#${this.gradientId})`}
				strokeWidth={VIEWBOX_SIZE * annulusWidth}
				fill="none"
				strokeLinecap="round"/>
		</g>
	}

	componentDidMount() {
		const {
			value,
			max = 100,
			animationTime = 1000
		} = this.props;
		this.elArc = findDOMNode(this.refs.arc);
		this.elFullCircle = findDOMNode(this.refs['full-circle'])
		if (value <= max) {
			this.move(0, Math.ceil(value), 1000 * Math.ceil(value) / (FRAME_NUMBER * animationTime));
		}
	}

	componentWillReceiveProps(nextProps) {
		const prev = Math.ceil(this.props.value),
			next = Math.ceil(nextProps.value);
		const {
			animationTime = 1000, max = 100
		} = nextProps;
		if (nextProps.value <= max && nextProps.value !== this.props.value) {
			this.move(prev, next, 1000 * Math.abs(next - prev) / (FRAME_NUMBER * animationTime));
		}
	}

	/**
	 * 动起来
	 * @param  {[type]}   prev  [description]
	 * @param  {Function} next  [description]
	 * @param  {Number}   speed [description]
	 * @return {[type]}         [description]
	 */
	move(prev, next, speed = 1) {
		const {
			beginAngel = ANGEL, max = 100
		} = this.props;
		if (prev === max) {
			this.elFullCircle.setAttribute('fill', `url(#${this.gradientId})`);
			return false;
		} else {
			this.elFullCircle.setAttribute('fill', 'none');
		}
		const endAngel = beginAngel + prev / max * 360;
		const start = {
				x: VIEWBOX_SIZE / 2 - Math.sin(beginAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((270 - beginAngel) * Math.PI / 180) * ARC_R
			},
			end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((270 - endAngel) * Math.PI / 180) * ARC_R
			};
		let nextPrev = 0;

		this.elArc.setAttribute('d', `M${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 ${endAngel - beginAngel > 180 ? 1 : 0} 0 ${end.x} ${end.y}`);

		if (prev < next) {
			nextPrev = prev + speed > next ? next : prev + speed;
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		} else if (prev > next) {
			nextPrev = prev - speed < next ? next : prev - speed;
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		} else {
			// this.elScales.children[prev] && this.elScales.children[prev].setAttribute('class', 'scale-site');
		}

	}

	/**
	 * 画那个圆
	 * @return {[type]} [description]
	 */
	drawCircle() {
		const {
			annulusWidth = ANNULUS_WIDTH,
			lineColor = '#e7f0ff',
			bgColor = '#f8fafe',
			color
		} = this.props;
		const anWidth = VIEWBOX_SIZE * annulusWidth; //圆弧宽度
		return <g>
			<circle cx="50%" cy="50%" r={ARC_R + anWidth / 2}
				fill={lineColor}/>
			<circle cx="50%" cy="50%" r={ARC_R + anWidth / 2}
				fill='none' ref="full-circle"/>
			<circle cx="50%" cy="50%" r={ARC_R  + anWidth / 2 - VIEWBOX_SIZE * annulusWidth}
				fill="#FFF"/>
			<circle cx="50%" cy="50%" r={ARC_R  + anWidth / 2 - ARC_ROUND_DISTANCE  - VIEWBOX_SIZE * annulusWidth}
				fill={bgColor}/>
		</g>
	}

	/**
	 * 中间的文字部分
	 * @return {[type]} [description]
	 */
	drawContent() {
		const { value = 70, max = 100, title = '使用率(%)', colors = ['#B78BEE', '#1790DC']} = this.props;
		const length = (value + '').replace(/\./, '').length;
		const fontSize = length === 1 ? 100 : 200 / length;
		// const fontSize = 200 / (value + '').replace(/\./, '').length + 'px';
		return <g>
			<text x="50%" y="50%"
				style={{fontSize: fontSize + 'px'}}
				styleName="text-value"
				fill={colors[colors.length - 1]}>
				<tspan>{value > max ? max : value}</tspan>
				<tspan dy="10" style={{fontSize: fontSize * 1 / 3 + 'px'}}>%</tspan>
			</text>
			<text x="50%" y="70%"
				styleName="text-title"
				fill='#999'>{title}</text>
		</g>
	}

	render() {
		return <svg xmlns={SVG_NS}
				xmlnsXlink={XLINK_NS}
				width="100%" height="100%"
				styleName="circel-chart-svg"
				viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
				>
			<defs>
				{this.defineLinearGradient()}
			</defs>
			{this.drawCircle()}
			{this.drawArc()}
			{this.drawContent()}
		</svg>
	}
}