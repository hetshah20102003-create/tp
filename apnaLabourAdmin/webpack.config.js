const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js', // ✅ ensures split chunks get named properly
    publicPath: '/',                   // ✅ ensures correct URLs for dynamic chunks
    clean: true,
  },
  optimization: {
    minimize: true, // Keep minification for bundle
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        exclude: /firebase-messaging-sw\.js$/, // Exclude service worker from minification
      }),
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /firebase-messaging-sw\.js$/], // Exclude service worker from processing
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'], // Exclude service worker from general copy
          },
        },
        {
          from: 'amplify.yml',
          to: 'amplify.yml',
        },
      ],
    }),
    // Custom plugin removal: service worker now handled by CopyWebpackPlugin
  ],
  devServer: {
    static: path.resolve(__dirname, 'public'),
    compress: true,
    port: 3000,
    hot: true,
    liveReload: true,
    historyApiFallback: true, // ✅ Fix routing for SPA locally
    client: {
      logging: 'warn', // Reduce console noise - only show warnings/errors
      overlay: {
        errors: true,
        warnings: false,
      },
      reconnect: 5, // Retry connection up to 5 times
    },
    // Suppress WebSocket connection errors in console
    onListening: (devServer) => {
      if (!devServer) {
        return;
      }
      console.log('🚀 Dev server running on http://localhost:3000');
    },
  },
};
