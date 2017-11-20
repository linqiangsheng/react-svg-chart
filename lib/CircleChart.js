'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _partial2 = require('lodash/partial');

var _partial3 = _interopRequireDefault(_partial2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _utils = require('../helpers/utils.js');

var _utils2 = _interopRequireDefault(_utils);

require('../style/chart.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (module.hot) {
	module.hot.accept('../style/chart.less', function () {
		require('../style/chart.less');
	});
}

var ANGEL = 40,
    //起始角度
VIEWBOX_SIZE = 300,
    //视图大小
ARC_R = 135,
    //外圆弧半径
SCALE_SIZE = 0.5,
    //刻度占圆环比例
ARC_ROUND_DISTANCE = 5,
    //圆弧与圆环的距离
ANNULUS_WIDTH = 0.14,
    //圆环默认宽度
SVG_NS = 'http://www.w3.org/2000/svg',
    XLINK_NS = 'http://www.w3.org/1999/xlink',
    FRAME_NUMBER = 60; //假设浏览器每秒60祯


var CircleChart = function (_React$Component) {
	_inherits(CircleChart, _React$Component);

	function CircleChart(props) {
		_classCallCheck(this, CircleChart);

		var _this = _possibleConstructorReturn(this, (CircleChart.__proto__ || Object.getPrototypeOf(CircleChart)).call(this, props));

		_this.defineLinearGradient = _this.defineLinearGradient.bind(_this);
		_this.drawArc = _this.drawArc.bind(_this);
		_this.move = _this.move.bind(_this);
		_this.drawContent = _this.drawContent.bind(_this);

		//由于多组件复用，会导致id冲突，因此使用uuid生成唯一标示的id
		_this.gradientId = _utils2.default.generateUUID();
		_this.filterId = _utils2.default.generateUUID();
		_this.scaleId = _utils2.default.generateUUID();
		return _this;
	}

	/**
  * 定义渐变色
  * @return {[type]} [description]
  */


	_createClass(CircleChart, [{
		key: 'defineLinearGradient',
		value: function defineLinearGradient() {
			var _props$colors = this.props.colors,
			    colors = _props$colors === undefined ? ['#B78BEE', '#1790DC'] : _props$colors;

			var percent = 100 / colors.length;
			return _react2.default.createElement(
				'linearGradient',
				{ id: this.gradientId, x1: '0', y1: '0', x2: '0', y2: '1' },
				(0, _map3.default)(colors, function (item, index) {
					return _react2.default.createElement('stop', { key: item, offset: index * percent + '%', style: { stopColor: item } });
				})
			);
		}

		/**
   * 画外圆弧
   * @return {[type]} [description]
   */

	}, {
		key: 'drawArc',
		value: function drawArc() {
			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'defs',
					null,
					_react2.default.createElement(
						'filter',
						{ id: this.filterId, x: '-1', y: '-1', width: '30', height: '30' },
						_react2.default.createElement('feOffset', { result: 'offOut', 'in': 'SourceAlpha', dx: '0', dy: '0' }),
						_react2.default.createElement('feGaussianBlur', { result: 'blurOut', 'in': 'offOut', stdDeviation: '2' }),
						_react2.default.createElement('feBlend', { 'in': 'SourceGraphic', in2: 'blurOut', mode: 'normal' })
					)
				),
				_react2.default.createElement('path', { ref: 'arc',
					stroke: 'url(#' + this.gradientId + ')',
					strokeWidth: '2',
					fill: 'none',
					strokeLinecap: 'round' }),
				_react2.default.createElement('circle', { ref: 'point',
					r: '8', stroke: '#FFF', strokeWidth: '4', fill: '#7C9BE1',
					filter: 'url(#' + this.filterId + ')' })
			);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _props = this.props,
			    value = _props.value,
			    _props$max = _props.max,
			    max = _props$max === undefined ? 100 : _props$max,
			    _props$animationTime = _props.animationTime,
			    animationTime = _props$animationTime === undefined ? 1000 : _props$animationTime;

			this.elArc = (0, _reactDom.findDOMNode)(this.refs.arc);
			this.elPoint = (0, _reactDom.findDOMNode)(this.refs.point);
			this.elScales = (0, _reactDom.findDOMNode)(this.refs.scales);
			if (value <= max) {
				this.move(0, Math.ceil(value), 1000 * Math.ceil(value) / (FRAME_NUMBER * animationTime));
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			var prev = Math.ceil(this.props.value),
			    next = Math.ceil(nextProps.value);
			var _nextProps$animationT = nextProps.animationTime,
			    animationTime = _nextProps$animationT === undefined ? 1000 : _nextProps$animationT,
			    _nextProps$max = nextProps.max,
			    max = _nextProps$max === undefined ? 100 : _nextProps$max;

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

	}, {
		key: 'move',
		value: function move(prev, next) {
			var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
			var _props2 = this.props,
			    _props2$beginAngel = _props2.beginAngel,
			    beginAngel = _props2$beginAngel === undefined ? ANGEL : _props2$beginAngel,
			    _props2$max = _props2.max,
			    max = _props2$max === undefined ? 100 : _props2$max;

			var endAngel = beginAngel + prev / max * (360 - beginAngel * 2);
			var start = {
				x: VIEWBOX_SIZE / 2 - Math.sin(beginAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - beginAngel) * Math.PI / 180) * ARC_R
			},
			    end = {
				x: VIEWBOX_SIZE / 2 - Math.sin(endAngel * Math.PI / 180) * ARC_R,
				y: VIEWBOX_SIZE / 2 + Math.sin((90 - endAngel) * Math.PI / 180) * ARC_R
			};
			var nextPrev = 0;
			this.elArc.setAttribute('d', 'M' + start.x + ' ' + start.y + ' A ' + ARC_R + ' ' + ARC_R + ' 0 ' + (endAngel - beginAngel > 180 ? 1 : 0) + ' 1 ' + end.x + ' ' + end.y);
			this.elPoint.setAttribute('cx', end.x);
			this.elPoint.setAttribute('cy', end.y);

			if (prev < next) {
				nextPrev = prev + speed > next ? next : prev + speed;
				for (var i = Math.floor(prev); i < nextPrev; i++) {
					this.elScales.children[i] && this.elScales.children[i].setAttribute('class', 'scale');
				}
				window.requestAnimationFrame((0, _partial3.default)(this.move, nextPrev, next, speed));
			} else if (prev > next) {
				nextPrev = prev - speed < next ? next : prev - speed;
				for (var _i = Math.ceil(prev); _i > nextPrev; _i--) {
					this.elScales.children[_i] && this.elScales.children[_i].setAttribute('class', '');
				}
				window.requestAnimationFrame((0, _partial3.default)(this.move, nextPrev, next, speed));
			} else {
				this.elScales.children[prev] && this.elScales.children[prev].setAttribute('class', 'scale-site');
			}
		}

		/**
   * 画那个圆
   * @return {[type]} [description]
   */

	}, {
		key: 'drawCircle',
		value: function drawCircle() {
			var _props$annulusWidth = this.props.annulusWidth,
			    annulusWidth = _props$annulusWidth === undefined ? ANNULUS_WIDTH : _props$annulusWidth;

			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement('circle', { cx: '50%', cy: '50%', r: ARC_R - ARC_ROUND_DISTANCE,
					fill: 'url(#' + this.gradientId + ')' }),
				_react2.default.createElement('circle', { cx: '50%', cy: '50%', r: ARC_R - ARC_ROUND_DISTANCE - VIEWBOX_SIZE * annulusWidth,
					fill: '#FFF' })
			);
		}

		/**
   * 画刻度
   * @return {[type]} [description]
   */

	}, {
		key: 'drawScale',
		value: function drawScale() {
			var _this2 = this;

			var paths = [];
			var _props3 = this.props,
			    _props3$max = _props3.max,
			    max = _props3$max === undefined ? 100 : _props3$max,
			    _props3$annulusWidth = _props3.annulusWidth,
			    annulusWidth = _props3$annulusWidth === undefined ? ANNULUS_WIDTH : _props3$annulusWidth,
			    _props3$beginAngel = _props3.beginAngel,
			    beginAngel = _props3$beginAngel === undefined ? ANGEL : _props3$beginAngel;

			var width = annulusWidth * VIEWBOX_SIZE * SCALE_SIZE,
			    interspace = (annulusWidth * VIEWBOX_SIZE - width) / 2; //计算刻度在圆环中剩余的空隙

			for (var i = 0; i <= max; i++) {
				var angel = beginAngel + i / max * (360 - beginAngel * 2);
				paths.push({
					x: VIEWBOX_SIZE / 2 - Math.sin(angel * Math.PI / 180) * (ARC_R - ARC_ROUND_DISTANCE - interspace),
					y: VIEWBOX_SIZE / 2 + Math.cos(angel * Math.PI / 180) * (ARC_R - ARC_ROUND_DISTANCE - interspace),
					angel: angel
				});
			}
			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'defs',
					null,
					_react2.default.createElement('path', { id: this.scaleId,
						d: 'M 0 0 h ' + width })
				),
				_react2.default.createElement(
					'g',
					{ ref: 'scales', className: 'scales' },
					(0, _map3.default)(paths, function (item, index) {
						var x = item.x,
						    y = item.y,
						    angel = item.angel;

						return _react2.default.createElement('use', { key: index, xlinkHref: '#' + _this2.scaleId,
							x: x,
							y: y,
							transform: 'rotate(' + (angel - 90) + ', ' + x + ', ' + y + ')' });
					})
				)
			);
		}

		/**
   * 中间的文字部分
   * @return {[type]} [description]
   */

	}, {
		key: 'drawContent',
		value: function drawContent() {
			var _props4 = this.props,
			    _props4$value = _props4.value,
			    value = _props4$value === undefined ? 70 : _props4$value,
			    _props4$max = _props4.max,
			    max = _props4$max === undefined ? 100 : _props4$max,
			    _props4$title = _props4.title,
			    title = _props4$title === undefined ? '使用率(%)' : _props4$title;

			var length = (value + '').replace(/\./, '').length;
			var fontSize = length === 1 ? 100 : 200 / length + 'px';
			// const fontSize = 200 / (value + '').replace(/\./, '').length + 'px';
			return _react2.default.createElement(
				'g',
				null,
				_react2.default.createElement(
					'text',
					{ x: '50%', y: '50%',
						style: { fontSize: fontSize },
						className: 'text-value',
						fill: 'url(#' + this.gradientId + ')' },
					value > max ? max : value
				),
				_react2.default.createElement(
					'text',
					{ x: '50%', y: '66%',
						className: 'text-title',
						fill: 'url(#' + this.gradientId + ')' },
					title
				)
			);
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'svg',
				{ xmlns: SVG_NS,
					xmlnsXlink: XLINK_NS,
					width: '100%', height: '100%',
					className: 'circel-chart-svg',
					viewBox: '0 0 ' + VIEWBOX_SIZE + ' ' + VIEWBOX_SIZE
				},
				_react2.default.createElement(
					'defs',
					null,
					this.defineLinearGradient()
				),
				this.drawCircle(),
				this.drawArc(),
				this.drawScale(),
				this.drawContent()
			);
		}
	}]);

	return CircleChart;
}(_react2.default.Component);

exports.default = CircleChart;