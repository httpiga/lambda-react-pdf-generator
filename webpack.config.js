const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  mode: (
    process.env.NODE_ENV == 'dev' // run from "npm run dev" for developing pdf React locally
    || slsw.lib.webpack.isLocal // serverless: true when handler is executed locally, false when executed on lambda
  ) ? 'development' : 'production',
  entry: process.env.NODE_ENV == 'dev' ? './dev.ts' : slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        type: 'asset/resource'
      }
    ],
  },
  plugins: process.env.NODE_ENV == 'dev' ? [
    // when developing pdf locally, launch nodemon after first webpack build
    new NodemonPlugin({ script: './dist/main.js' }),
  ] : [],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
