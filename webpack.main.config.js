const path = require('path');
const webpack = require('webpack');

const PROD = process.env.NODE_ENV === 'production';

const config = {
    target: 'electron',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: {
        main: './src/js/main/main.js',
    },
    output: {
        path: path.resolve(__dirname, 'app'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|json)$/,
                include: [
                    path.resolve(__dirname, 'src/js')
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify((PROD) ? 'production' : 'development')
        })
    ]
};

if (PROD) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false
        })
    );
}

module.exports = config;