const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

// PROD
module.exports = {
  mode: 'production',
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
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
      SERVER_URL: 'https://friday-nightz.herokuapp.com',
    }),
  ],
};

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
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
      // SERVER_URL: JSON.stringify(process.env.SERVER_URL),
    }),
    new Dotenv({
      SERVER_URL: JSON.stringify(process.env.SERVER_URL),
      TOKEN_INTERVAL: JSON.stringify(process.env.TOKEN_INTERVAL),
    }),
  ],
};
