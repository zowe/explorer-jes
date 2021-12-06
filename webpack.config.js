/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
* Copyright IBM Corporation 2018, 2020
 */

const PACKAGE = require('./package.json');

const DEVSERVER_HOST = PACKAGE.devServerHost || 'localhost';
const proxy = PACKAGE.proxy;
const APP_VERSION = PACKAGE.version;


const REACT_APP_ENVIRONMENT = process.env.NODE_ENV;
const debug = REACT_APP_ENVIRONMENT !== 'production';
const prod = REACT_APP_ENVIRONMENT === 'production';
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
        use: {
            loader:'babel-loader',
            options: {
                presets: ['@babel/react', '@babel/preset-env'],
                plugins: [['react-html-attrs'], ['@babel/plugin-proposal-decorators',{ 'legacy': true}]],
            },
    },
        include: [
            path.join(__dirname, 'WebContent'),
            path.join(__dirname, 'tests'),
        ],
        
    },
    {
        test: /\.(png|jpg|svg)$/,
        use: ['url-loader?limit=1&name=img/[name].[ext]'],
    },
    {
        test: /\.css$/,
        use: ['style-loader','css-loader'],
    },
];

const htmlTask = new HtmlWebpackPlugin({ template: './WebContent/index.html' });

const entry = path.join(__dirname, 'WebContent/js/index.js');
const output = {
    path: path.join(__dirname, OUTPUT_FOLDER),
    filename: 'app.[hash].min.js',
};

const defineEnvConstants = {
    'process.env.REACT_SYNTAX_HIGHLIGHTER_LIGHT_BUILD': true,
    'process.env.NODE_ENV': JSON.stringify(REACT_APP_ENVIRONMENT),
    'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
};

if (debug) {
    defineEnvConstants['process.env.DEVSERVER_HOSTNAME'] = JSON.stringify(DEVSERVER_HOST);
}

const definePlugin = new webpack.DefinePlugin(defineEnvConstants);

const plugins = debug ? [cleanTask, definePlugin, copyTask, htmlTask] : [cleanTask, definePlugin,
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
    minimize: prod,
    minimizer: debug ? [] : [new TerserPlugin({
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

const devServer = {
    host: DEVSERVER_HOST,
    https: true,
    proxy: {
        '*': {
            target: proxy.target,
            secure: false,
        },
    },
    open: true,
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
    devServer,
};
