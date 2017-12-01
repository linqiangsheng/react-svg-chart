import React from 'react';
import { findDOMNode } from 'react-dom';
import { map, partial } from 'lodash';
import utils from '../helpers/utils.js';
import '../style/chart.less';

const ANGEL = 40, //起始角度
	VIEWBOX_SIZE = 300, //视图大小
	ARC_R = 135, //外圆弧半径
	SCALE_SIZE = 0.5, //刻度占圆环比例
	ARC_ROUND_DISTANCE = 5, //圆弧与圆环的距离
	ANNULUS_WIDTH = 0.14, //圆环默认宽度
	SVG_NS = 'http://www.w3.org/2000/svg',
	XLINK_NS = 'http://www.w3.org/1999/xlink',
	FRAME_NUMBER = 60; //假设浏览器每秒60祯


export default class CircleChart extends React.Component {

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
		const {colors = ['#B78BEE', '#1790DC']} = this.props;
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
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"/>
			<circle ref="point"
				r="8" stroke="#FFF" strokeWidth="4" fill={pointColor}
				filter={`url(#${this.filterId})`}/>
		</g>
	}

	componentDidMount() {
		const {
			value,
			max = 100,
			animationTime = 1000
		} = this.props;
		this.elArc = findDOMNode(this.refs.arc);
		this.elPoint = findDOMNode(this.refs.point);
		this.elScales = findDOMNode(this.refs.scales);
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
		const endAngel = beginAngel + prev / max * (360 - beginAngel * 2);
		const start = {
				x: VIEWBOX_SIZE / 2 - Math.sin(beginAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - beginAngel) * Math.PI / 180) * ARC_R
			},
			end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
			};
		let nextPrev = 0;
		this.elArc.setAttribute('d', `M${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 ${endAngel - beginAngel > 180 ? 1 : 0} 1 ${end.x} ${end.y}`);
		this.elPoint.setAttribute('cx', end.x);
		this.elPoint.setAttribute('cy', end.y);

		if (prev < next) {
			nextPrev = prev + speed > next ? next : prev + speed;
			for (let i = Math.floor(prev); i < nextPrev; i++) {
				this.elScales.children[i] && this.elScales.children[i].setAttribute('class', 'scale');
			}
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		} else if (prev > next) {
			nextPrev = prev - speed < next ? next : prev - speed;
			for (let i = Math.ceil(prev); i > nextPrev; i--) {
				this.elScales.children[i] && this.elScales.children[i].setAttribute('class', '');
			}
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		} else {
			this.elScales.children[prev] && this.elScales.children[prev].setAttribute('class', 'scale-site');
		}

	}

	/**
	 * 画那个圆
	 * @return {[type]} [description]
	 */
	drawCircle() {
		const {
			annulusWidth = ANNULUS_WIDTH
		} = this.props;
		return <g>
			<circle cx="50%" cy="50%" r={ARC_R - ARC_ROUND_DISTANCE}
				fill={`url(#${this.gradientId})`}/>
			<circle cx="50%" cy="50%" r={ARC_R - ARC_ROUND_DISTANCE - VIEWBOX_SIZE * annulusWidth}
				fill="#FFF"/>
		</g>
	}

	/**
	 * 画刻度
	 * @return {[type]} [description]
	 */
	drawScale() {
		let paths = [];
		const {
			max = 100, annulusWidth = ANNULUS_WIDTH, beginAngel = ANGEL
		} = this.props;
		const width = annulusWidth * VIEWBOX_SIZE * SCALE_SIZE,
			interspace = (annulusWidth * VIEWBOX_SIZE - width) / 2; //计算刻度在圆环中剩余的空隙

		for (let i = 0; i <= max; i++) {
			const angel = beginAngel + i / max * (360 - beginAngel * 2);
			paths.push({
				x: VIEWBOX_SIZE / 2 - Math.sin(angel * Math.PI / 180) * (ARC_R - ARC_ROUND_DISTANCE - interspace),
				y: VIEWBOX_SIZE / 2 + Math.cos(angel * Math.PI / 180) * (ARC_R - ARC_ROUND_DISTANCE - interspace),
				angel: angel
			});
		}
		return <g>
			<defs>
				<path id={this.scaleId}
					d={`M 0 0 h ${width}`}/>
			</defs>
			<g ref="scales" styleName="scales">
				{map(paths, (item, index) => {
					const {x, y, angel} = item;
					return <use key={index} xlinkHref={`#${this.scaleId}`}
						x={x}
						y={y}
						transform={`rotate(${angel - 90}, ${x}, ${y})`}/>
				})}
			</g>
		</g>
	}

	/**
	 * 中间的文字部分
	 * @return {[type]} [description]
	 */
	drawContent() {
		const { value = 70, max = 100, title = '使用率(%)'} = this.props;
		const length = (value + '').replace(/\./, '').length;
		const fontSize = length === 1 ? 100 : 200 / length + 'px'
		// const fontSize = 200 / (value + '').replace(/\./, '').length + 'px';
		return <g>
			<text x="50%" y="50%"
				style={{fontSize: fontSize}}
				styleName="text-value"
				fill={`url(#${this.gradientId})`}>{value > max ? max : value}</text>
			<text x="50%" y="66%"
				styleName="text-title"
				fill={`url(#${this.gradientId})`}>{title}</text>
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
			{this.drawScale()}
			{this.drawContent()}
		</svg>
	}
}