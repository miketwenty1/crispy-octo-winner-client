const path = require('path');
const webpack = require('webpack');
// const Dotenv = require('dotenv-webpack');
require('dotenv').config();

// DEV
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  resolve: {
    fallback: {
      fs: false,
    },
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'project.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/,
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader',
      },
    ],
  },
  plugins: [
    // new webpack.EnvironmentPlugin({ ...process.env }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
      // SERVER_URL: JSON.stringify('http://localhost:4000'),
      SERVER_URL: JSON.stringify(process.env.SERVER_URL),
      // TOKEN_INTERVAL: JSON.stringify('3000'),
      TOKEN_INTERVAL: JSON.stringify(process.env.TOKEN_INTERVAL),
    }),
    // can't figure out how to make this work
    // new Dotenv({
    //   TOKEN_INTERVAL: JSON.stringify(process.env.TOKEN_INTERVAL),
    // }),
  ],
};
