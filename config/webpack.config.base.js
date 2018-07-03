'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ReactLoadablePlugin = require('react-loadable/webpack')
  .ReactLoadablePlugin;

const config = require('./env');
const utils = require('./utils');

const DEV_MODE = config.isDevMode();
const isHMREnabled = config.isHMREnabled();
const isSSREnabled = config.isSSREnabled();
const APP_PATH = utils.APP_PATH;
const CONTENT_PATH = APP_PATH;
const APP_BUILD_PATH = utils.APP_BUILD_PATH;
const ENTRY_NAME = utils.ENTRY_NAME;

const defaultPrefix = config.getApiEndPoints().defaultPrefix;

const appPrefix = utils.normalizeTailSlash(
  config.getAppPrefix(),
  config.isPrefixTailSlashEnabled()
);
const prefix = utils.normalizeTailSlash(
  utils.normalizePublicPath(
    path.join(config.getAppPrefix(), config.getStaticPrefix())
  ),
  config.isPrefixTailSlashEnabled()
);

const appIndex = path.join(APP_PATH, 'index.js');

let entry = undefined;
if (isHMREnabled) {
  entry = [appIndex];
} else {
  entry = {
    [ENTRY_NAME.APP]: appIndex,
  };
}

const webpackConfig = {
  entry,
  output: {
    path: APP_BUILD_PATH,
  },
  resolve: {
    modules: [APP_PATH, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      src: APP_PATH,
      content: utils.resolve('src/content'),
      components: utils.resolve('src/components'),
      store: utils.resolve('src/store'),
      'lodash-es': 'lodash',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            // ...JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc'), {encoding: 'utf-8'})),
            // babelrc: path.join(__dirname, '../.babelrc'),
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              context: CONTENT_PATH,
              name: utils.getResourceName(DEV_MODE),
              limit: 1024,
            },
          },
          // {
          //   loader: 'image-webpack-loader',
          //   options: {
          //     bypassOnDebug: DEV_MODE,
          //   },
          // },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        options: {
          context: CONTENT_PATH,
          name: utils.getResourceName(DEV_MODE),
          limit: 5000,
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['./build/app'], { root: process.cwd() }),
    new webpack.DefinePlugin({
      __isBrowser__: true,
      __HMR__: isHMREnabled,
      __SSR__: isSSREnabled,
      'process.env.DEV_MODE': DEV_MODE,
      'process.env.prefix': JSON.stringify(prefix),
      'process.env.appPrefix': JSON.stringify(appPrefix),
      'process.env.NODE_ENV': JSON.stringify(config.getNodeEnv()),
      'process.env.apiPrefix': JSON.stringify(
        config.isCustomAPIPrefix() ? defaultPrefix : ''
      ),
    }),
    new webpack.LoaderOptionsPlugin({
      debug: DEV_MODE,
      minimize: !DEV_MODE,
      options: {
        context: CONTENT_PATH,
      },
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn'],
    }),
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: isSSREnabled ? 'index-backup.html' : 'index.html',
      inject: 'body',
      chunksSortMode: 'dependency',
    }),
    new CopyWebpackPlugin([
      {
        from: utils.resolve('src/assets/static'),
        to: utils.resolve('build/app/assets/static'),
      },
    ]),
    new ReactLoadablePlugin({
      filename: utils.resolve('build/react-loadable.json'),
    }),
    new ManifestPlugin({
      publicPath: '',
    }),
    // new HtmlWebpackCustomPlugin(),
  ],
};

function HtmlWebpackCustomPlugin(options) {
  // Configure your plugin with options...
}

HtmlWebpackCustomPlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap(
    'InsertSSRBundleScriptsPlugin',
    compilation => {
      console.log('The compiler is starting a new compilation...');

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
        'InsertSSRBundleScriptsPlugin',
        (data, cb) => {
          console.log('data: ', data.assets);
          // console.log('chunks: ', data.assets.chunks);
          // console.log('compilation.assets.app: ', Object.getOwnPropertyNames(compilation));
          console.log('compilation.entries: ', compilation.entries.length);
          // console.log('compilation.entries: ', compilation.entries[0].NormalModule.dependencies);
          console.log(
            'compilation.chunks: ',
            compilation.chunks.length,
            compilation.chunks
          );
          // console.log('compilation.assets: ', compilation.assets);
          cb(null, data);
        }
      );
    }
  );
};

module.exports = webpackConfig;
