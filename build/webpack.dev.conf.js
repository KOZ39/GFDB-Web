'use strict'
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const webpackBaseConf = require('./webpack.base.conf.js')
const config = require('./config/index.js')

const {
  languages,

  ROOT,
  SRC,

  dev,
} = config
const {
  host,
  port,
  notifyOnErrors,
} = dev

/** 自定义的错误输出格式 */
const createNotifierCallback = () => {
  const notifier = require('node-notifier')
  /* eslint-disable-next-line */
  const packageConfig = require(path.resolve(ROOT, 'package.json'))


  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      // icon: path.join(__dirname, 'logo.png'),
    })
  }
}

module.exports = merge(webpackBaseConf, {
  mode: 'development',

  output: {
    path: config.OUTPUT_DIR,
    publicPath: config.PUBLIC_PATH,
    filename: '[name]/index.js',
    chunkFilename: 'chunks/[id]_[chunkhash:6].js',
  },

  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        include: path.resolve(ROOT, './node_modules'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
            },
          },
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(le|c)ss$/,
        include: SRC,
        use: [
          // {
          //   loader: 'style-loader',
          // },
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              context: SRC,
              localIdentName: '[local]___[hash:base64:6]',
              camelCase: true,
            },
          },
          {
            loader: 'less-loader',
          },
          {
            loader: 'style-resources-loader',
            options: {
              patterns: path.resolve(SRC, './utils/less/variables/*.less'),
              injector: 'append'
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // css extract
    new MiniCssExtractPlugin({
      filename: 'styles.css',
      chunkFilename: '[id].css',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // 优化错误提示
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`],
      },
      onErrors: notifyOnErrors
        ? createNotifierCallback()
        : undefined,
    }),
    // // 注册react全局引用
    // new webpack.ProvidePlugin({
    //   'React': 'react',
    //   'ReactDOM': 'react-dom',
    // }),
  ],

  // 使用 source-map
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: './dist',
    publicPath: '/',
    // 设置localhost端口
    host: host,
    port: port,
    disableHostCheck: true,
    // 自动打开浏览器
    // open: true,
    hot: true,
    quiet: true,
    historyApiFallback: {
      rewrites: languages.map(d => {
        return {
          from: `^\/${d.name}`,
          to: `/${d.name}/`,
        }
      }),
    },
  },
})
