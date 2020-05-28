/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

const REACT_APP_ENVIRONMENT = process.env.NODE_ENV;
const debug = REACT_APP_ENVIRONMENT !== 'production';
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER || 'dist';

const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const copyTask = new CopyWebpackPlugin([{
    from: path.resolve(__dirname, './WebContent/zlux-hooks'),
    to: path.resolve(OUTPUT_FOLDER, 'zlux-hooks'),
},
{
    from: path.resolve(__dirname, './WebContent/css'),
    to: path.resolve(OUTPUT_FOLDER, 'css'),
},
{
    from: path.resolve(__dirname, './WebContent/img'),
    to: path.resolve(OUTPUT_FOLDER, 'img'),
},
{
    from: path.resolve(__dirname, './WebContent/index.html'),
    to: path.resolve(OUTPUT_FOLDER),
},
{
    from: path.resolve(__dirname, './WebContent/favicon.ico'),
    to: path.resolve(OUTPUT_FOLDER),
},
]);

const cleanTask = new CleanWebpackPlugin();

module.exports = {
    devtool: debug ? 'source-map' : false,
    entry: path.join(__dirname, 'WebContent/js/index.js'),
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    path.join(__dirname, 'WebContent'),
                    path.join(__dirname, 'tests'),
                ],
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
                },
            },
            {
                test: /\.(png|jpg|svg)$/,
                loader: 'url-loader?limit=1&name=img/[name].[ext]',
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
        ],
    },
    output: {
        path: path.join(__dirname, OUTPUT_FOLDER),
        filename: 'app.min.js',
    },
    plugins: debug ? [cleanTask, copyTask] : [cleanTask,
        new webpack.DefinePlugin({
            'process.env.REACT_SYNTAX_HIGHLIGHTER_LIGHT_BUILD': true,
            'process.env.NODE_ENV': JSON.stringify(REACT_APP_ENVIRONMENT),
        }),
        new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
                ecma: 8,
                compress: {
                    warnings: false,
                },
            },
        }),
        new CompressionPlugin({
            threshold: 100000,
            minRatio: 0.8,
        }),
        copyTask,
    ],
};
