/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

const debug = process.env.NODE_ENV !== 'production';
const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: debug ? 'inline-sourcemap' : false,
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
        path: path.join(__dirname, 'web'),
        filename: 'app.min.js',
    },
    plugins: debug ? [] : [
        new webpack.DefinePlugin({
            'process.env.REACT_SYNTAX_HIGHLIGHTER_LIGHT_BUILD': true,
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            sourcemap: false,
            compress: {
                screw_ie8: true,
                warnings: false,
            },
        }),
    ],
};
