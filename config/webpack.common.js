var webpack = require('webpack');
var helpers = require('./helpers');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'bundle': './app/main.js'
    },

    resolve: {
        extensions: ['.js']
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
    ]

};
