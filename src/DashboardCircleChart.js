import React from 'react';
import { findDOMNode } from 'react-dom';
import { map, partial, filter } from 'lodash';
import utils from '../helpers/utils.js';
import '../style/chart.less';

const ANGEL = 40, //起始角度
	VIEWBOX_SIZE = 300, //视图大小
	ARC_R = 130, //外圆弧半径
	SCALE_SIZE = 0.5, //刻度占圆环比例
	ARC_ROUND_DISTANCE = 10, //圆弧与圆环的距离
	ANNULUS_WIDTH = 0.072, //圆环默认宽度
	SVG_NS = 'http://www.w3.org/2000/svg',
	XLINK_NS = 'http://www.w3.org/1999/xlink',
	FRAME_NUMBER = 60; //假设浏览器每秒60祯


export default class DashboardCircleChart extends React.Component {

	constructor(props) {
		super(props);
		this.defineLinearGradient = this.defineLinearGradient.bind(this);
		this.drawArc = this.drawArc.bind(this);
		this.move = this.move.bind(this);
		this.drawContent = this.drawContent.bind(this);
		this.getPoints = this.getPoints.bind(this);

		//由于多组件复用，会导致id冲突，因此使用uuid生成唯一标示的id
		this.gradientIdPre = utils.generateUUID();
		this.gradientIdSuf = utils.generateUUID();
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
		const preColors = filter(colors, (item, key) => {
			return key <= Math.ceil(colors.length / 2)
		}), sufColors = colors.length === 1 ? colors : filter(colors,  (item, key) => {
			return key >= Math.ceil(colors.length / 2)
		})
		return <g>
			<linearGradient id={this.gradientIdPre} x1="1" y1="1" x2="2" y2="0">
				{map(preColors, (item, index) => {
					return <stop key={item} offset={index * percent + '%'} style={{stopColor: item}}/>
				})}
			</linearGradient>
			<linearGradient id={this.gradientIdSuf} x1="1" y1="0" x2="2" y2="1">
				{map(sufColors, (item, index) => {
					return <stop key={item} offset={index * percent + '%'} style={{stopColor: item}}/>
				})}
			</linearGradient>
		</g>
	}

	/**
	 * 画外圆弧
	 * @return {[type]} [description]
	 */
	drawArc() {
		const {colors = ['#B78BEE', '#1790DC'], annulusWidth = ANNULUS_WIDTH, beginAngel = ANGEL} = this.props;
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

		const {start} = this.getPoints();

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
			<path ref="arc-pre"
				stroke={`url(#${this.gradientIdPre})`}
				strokeWidth={VIEWBOX_SIZE * annulusWidth}
				fill="none"/>
			<circle fill={colors[0]} cx={start.x} cy={start.y} r={VIEWBOX_SIZE * annulusWidth / 2}/>
			<circle ref="end-circle" fill={colors[colors.length - 1]} cx={-10} cy={-10} r={VIEWBOX_SIZE * annulusWidth / 2}/>
			<path ref="arc-suf"
				stroke={`url(#${this.gradientIdSuf})`}
				strokeWidth={VIEWBOX_SIZE * annulusWidth}
				fill="none"/>
		</g>
	}

	componentDidMount() {
		const {
			value,
			max = 100,
			animationTime = 1000
		} = this.props;
		this.elArcPre = findDOMNode(this.refs['arc-pre']);
		this.elArcSuf = findDOMNode(this.refs['arc-suf']);
		this.elFullCircle = findDOMNode(this.refs['full-circle']);
		this.elEndCircle = findDOMNode(this.refs['end-circle'])
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

		const {start, middle} = this.getPoints();
		const endAngel = beginAngel + prev / max * (360 - beginAngel * 2);
		const end = {
			x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
			y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
		};
		let nextPrev = 0;
		if (prev * 2 <= max) {
			this.elArcPre.setAttribute('d', `M${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 0 1 ${end.x} ${end.y}`);
		} else {
			this.elArcPre.setAttribute('d', `M${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 0 1 ${middle.x} ${middle.y}`);
			this.elArcSuf.setAttribute('d', `M${middle.x} ${middle.y} A ${ARC_R} ${ARC_R} 0 0 1 ${end.x} ${end.y}`);
		}

		this.elEndCircle.setAttribute('cy', end.y);
		this.elEndCircle.setAttribute('cx', end.x);

		if (prev < next) {
			nextPrev = prev + speed > next ? next : prev + speed;
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		} else if (prev > next) {
			nextPrev = prev - speed < next ? next : prev - speed;
			window.requestAnimationFrame(partial(this.move, nextPrev, next, speed));
		}
	}

	/**
	 * 获取关键的节点，起点中点和终点
	 * @return {[type]} [description]
	 */
	getPoints() {
		const {
			beginAngel = ANGEL
		} = this.props;

		const endAngel = 360 - beginAngel;
		const start = {
				x: VIEWBOX_SIZE / 2 - Math.sin(beginAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - beginAngel) * Math.PI / 180) * ARC_R
			},
			end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
			},
			middle = {
				x: VIEWBOX_SIZE / 2 - Math.sin(Math.PI) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin(270 * Math.PI / 180) * ARC_R
			}
		return {start, end, middle}
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
			beginAngel = ANGEL
		} = this.props;
		const anWidth = VIEWBOX_SIZE * annulusWidth; //圆弧宽度
		const endAngel = 360 - beginAngel
		const {start, end} = this.getPoints();

		return <g>
			<path d={`M${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 1 1 ${end.x} ${end.y}`}
				fill='none'
				stroke={lineColor}
				strokeWidth={VIEWBOX_SIZE * annulusWidth}
				strokeLinecap="round"/>
		</g>
	}

	/**
	 * 中间的文字部分
	 * @return {[type]} [description]
	 */
	drawContent() {
		const { value = 70, max = 100, title = '使用率(%)', colors = ['#B78BEE', '#1790DC'], isScaleVisible = false} = this.props;
		const length = (value + '').replace(/\./, '').length;
		const fontSize = length === 1 ? 100 : 230 / length + 'px';
		const { start, end } = this.getPoints();
		return <g>
			<text x="50%" y="47%"
				style={{fontSize: fontSize}}
				styleName="text-value"
				fill={`${colors[colors.length - 1]}`}>{value > max ? max : value}</text>
			<text x="50%" y="70%"
				styleName="text-title"
				style={{fontSize: '30px'}}
				fill={`#9C9C9C`}>{title}</text>
			{isScaleVisible && [
				<text key={'scale-0'} x={start.x + 3} y={start.y + 30}
					styleName="text-scale">0</text>,
				<text key={'scale-max'} x={end.x} y={end.y + 30}
					styleName="text-scale">{max}</text>
				]}
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