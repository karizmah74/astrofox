const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  mode: PRODUCTION ? 'production' : 'development',
  target: 'electron-renderer',
  devtool: PRODUCTION ? false : 'source-map',
  entry: {
    app: path.resolve(__dirname, 'src/view/index.js'),
  },
  devServer: {
    hotOnly: true,
    port: 3000,
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    publicPath: '/',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'src/view'), 'node_modules'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'src/build/loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !PRODUCTION,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: PRODUCTION ? '[hash:base64]' : '[name]__[local]--[hash:base64:5]',
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        include: path.resolve(__dirname, 'src/view/assets/images'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images',
            publicPath: 'images',
          },
        },
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
          },
        },
      },
      {
        test: /\.(html|css)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.glsl$/,
        use: {
          loader: 'glsl-loader',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new SpriteLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/view/assets/images'),
          to: path.resolve(__dirname, 'app/images'),
        },
        {
          from: path.resolve(__dirname, 'src/view/assets/fonts'),
          to: path.resolve(__dirname, 'app/fonts'),
        },
      ],
    }),
  ],
  optimization: {
    minimize: PRODUCTION,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
    ],
  },
};
