/**
 * Webpack configuration
 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');

const ENV = process.env.NODE_ENV || 'development';

let config = {
    entry: {
        HeavenScroll: path.join(__dirname, 'src/wrapper.js'),
        dependencies: [
            'jquery',
            'lodash'
        ],
        demo: [
            path.join(__dirname, 'demo/app.js')
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.json' , '.css', '.scss'],
        modules: [ 'node_modules', 'src' ],
        alias: {
            jquery: 'jquery/src/jquery'
        }
    },
    module: {
        loaders: [
            {
                enforce: 'pre',
                test: /\.js?$/,
                exclude: /(node_modules|vendors)/,
                loader: 'eslint-loader',
                options: {
                    parserOptions: { sourceType: 'module' }
                }
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                   plugins: ["transform-runtime", "transform-decorators-legacy"],
                   presets: ["es2017", "es2015"]
                 }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [autoprefixer]
                        }
                    }, 'sass-loader', 'resolve-url-loader']
                })
            },
            {
                test: /\.(ttf|eot|woff2?)(\?v=[a-z0-9=\.]+)?$/i,
                loader: 'file-loader?name=./fonts/[name].[ext]'
            },
            {
                test: /\.(jpe?g|png|gif|svg|ico)$/i,
                loaders: 'file-loader?name=./img/[sha512:hash:base64:7].[ext]'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'demo.css',
            allChunks: false
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({'NODE_ENV': ENV})
        }),
        new CopyWebpackPlugin([
            { from: 'demo/index.html', to: 'index.html' }
        ])
    ],
    devtool: 'source-map'
};

if (ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
