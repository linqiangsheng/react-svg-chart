var webpack = require('webpack');
var path = require('path');
var fs = require('fs');


/* -------- DEV-Server 配置 --------- */
var devServer = {
		inline: true,
		contentBase: path.resolve(__dirname, '..', 'lib'),
		port: 9000,
		host: '0.0.0.0',
		historyApiFallback: false,
		lazy: false,
		hot: true,
		disableHostCheck: true,
		proxy: {
			'*': 'http://127.0.0.1:8000'
		},
		watchOptions: {
			ignored: /node_modules/,
			poll: false,
		}
	}
	/* -------- END --------- */



/* -------- lessLoader ------ */
var lessLoader = function(lessPath, isModules) {
	return {
		test: /\.less$/,
		include: lessPath,
		loaders: ['style-loader', {
			loader: 'css-loader',
			options: {
				importLoader: true,
				modules: isModules,
				localIdentName: isModules ? '[name]__[local]__[hash:base64:5]' : '[name]'
			}
		}, {
			loader: 'postcss-loader',
			options: {
				plugins: [
					require('autoprefixer')({
						browsers: ['last 5 versions']
					})
				]
			}
		}, {
			loader: 'less-loader'
		}]
	}
}
/* -------- END --------- */

module.exports = {
	context: path.resolve(__dirname, '..'), //指定上下文环境
	devtool: 'cheap-module-eval-source-map', //开启source-map
	entry: {
		index: [
			'babel-polyfill',
			'webpack-dev-server/client?http://0.0.0.0:9000',
			'webpack/hot/only-dev-server',
			path.resolve(__dirname, '..', 'samples', 'index.js')
		]
	},
	output: {
		filename: '[name].js',
		publicPath: '/static',
		path: path.resolve(__dirname, '..', 'public')
	},
	devServer: devServer,
	module: {
		rules: [
			lessLoader(path.resolve(__dirname, '..', 'style'), true),
			{
				//加载组件内部依赖的css
				test: /\.css$/,
				include: [path.resolve(__dirname, '..', 'node_modules'), path.resolve(__dirname, '..', 'lib')],
				loaders: ['style-loader', {
					loader: 'css-loader',
					options: {
						importLoader: true,
						modules: false
					}
				}]
			}, {
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loaders: [{
					loader: 'babel-loader?cacheDirectory' //使用babel-loader对js进行装载，具体看.babelrc
				}]
			}, {
				test: /\.(png|jpg)$/,
				loaders: [{
					loader: 'url-loader',
					options: {
						limit: 8192
					}
				}]
			}, {
				test: /\.(woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
				loaders: [{
					loader: 'url-loader',
					options: {
						limit: 8192
					}
				}]
			}, {
				test: /\.json$/,
				loaders: [{
					loader: 'json-loader'
				}]
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new webpack.NamedModulesPlugin(),
		// new webpack.DllReferencePlugin({
		// 	manifest: require('../public/static/vendor-manifest.json'),
		// 	name: 'vendor'
		// }),
		new webpack.HotModuleReplacementPlugin()
	]
}