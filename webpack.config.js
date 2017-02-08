var webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: './lib/',
        filename: "index.js",
        libraryTarget: "umd"
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};