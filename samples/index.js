/**
 * User: _Jay
 * Desciption: 入口文件，该文件不会被热更新所加载
 * Dependent on: react, react-dom, react-redux
 * Datetime: date time
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './Chart.js';

ReactDOM.render(<Chart/>, document.getElementById('root'))

if (module.hot) {
    module.hot.accept('./Chart.js', () => {
        const NextCircleChart = require('./Chart.js').default;
        ReactDOM.render(<NextCircleChart/>, document.getElementById('root'));
    });
}