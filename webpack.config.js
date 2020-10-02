/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
* Copyright IBM Corporation 2018, 2020
 */

const REACT_APP_ENVIRONMENT = process.env.NODE_ENV;
const debug = REACT_APP_ENVIRONMENT !== 'production';
const analyze = process.env.ANALYZE;
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER || 'dist';

const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const copyArray = [{
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
    from: path.resolve(__dirname, './WebContent/favicon.ico'),
    to: path.resolve(OUTPUT_FOLDER),
},
];

const copyTask = new CopyWebpackPlugin({
    patterns: copyArray,
});

const cleanTask = new CleanWebpackPlugin();
const rules = [
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
];

const htmlTask = new HtmlWebpackPlugin({ template: './WebContent/index.html' });

const entry = path.join(__dirname, 'WebContent/js/index.js');
const output = {
    path: path.join(__dirname, OUTPUT_FOLDER),
    filename: 'app.[hash].min.js',
};

const plugins = debug ? [cleanTask, copyTask, htmlTask] : [cleanTask,
    new webpack.DefinePlugin({
        'process.env.REACT_SYNTAX_HIGHLIGHTER_LIGHT_BUILD': true,
        'process.env.NODE_ENV': JSON.stringify(REACT_APP_ENVIRONMENT),
    }),
    new CompressionPlugin({
        threshold: 100000,
        minRatio: 0.8,
    }),
    copyTask,
    htmlTask,
];

if (analyze) {
    plugins.push(new BundleAnalyzerPlugin());
}

const optimization = {
    minimize: debug,
    minimizer: debug ?[]:[new TerserPlugin({
        terserOptions: {
            ecma: 8,
            compress: {
                ie8: false,
                warnings: false,
            },
        },
        extractComments: false,
    })],
};

module.exports = {
    devtool: debug ? 'source-map' : false,
    entry,
    module: {
        rules,
    },
    output,
    plugins,
    optimization,
    mode: REACT_APP_ENVIRONMENT,
};
