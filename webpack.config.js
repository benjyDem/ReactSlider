var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './js/example.js',
    output: { path: __dirname, filename: 'example.build.js' },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader?includePaths[]='+ path.resolve(__dirname, 'node_modules'))
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/ReactSlider.css')
    ]
};