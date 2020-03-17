const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
'use strict'
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const userApi = {
  dev: 15012,
  rc: 15008,
  uat: 15042,
  mock: 15016
}
const env = 'uat'
const userApiPort = userApi[env] || 5000
const esApiPort = userApi[env] || 7000
const url = {
  tq: 'http://10.51.72.81', // 何天琪
  wt: 'http://10.51.72.33', // 吴涛
  zyd: 'http://10.51.72.84', // 朱永东
  psy: 'http://10.51.72.168', // 潘胜阳
  lyy: 'http://10.51.72.163', // 刘洋洋
  mock: `http://42.48.104.46`, // mock
  dev: `http://42.48.104.46`, // dev
  rc: `http://42.48.104.46`, // rc
  uat: `http://42.48.104.46`, // uat
  prod: `https://www.ccyunchina.com` // prod
}
const proxy = url[env]
module.exports = {
  devServer: {
    port: '8080', // 代理端口
    open: true, // 项目启动时是否自动打开浏览器，我这里设置为false,不打开，true表示打开
    proxy: {
      '/user-api': {
        target: `${env === 'prod' ? proxy : proxy + ':' + userApiPort}`, // 服务器 api地址
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          // 重写路径
          '^/user-api': env === 'mock' ? '/mock/8/user-api/' : '/user-api'
        }
      },
      '/static': {
        target: `${env === 'prod' ? proxy : proxy + ':' + userApiPort}`, // 服务器 api地址
        changeOrigin: true // 是否跨域
      },
      '/group1': {
        target: `${env === 'prod' ? proxy : proxy + ':' + userApiPort}`, // 服务器 api地址
        changeOrigin: true // 是否跨域
      },
      '/search-api': {
        target: `${env === 'prod' ? proxy : proxy + ':' + esApiPort}`, // 服务器dev search-api地址
        changeOrigin: true // 是否跨域
      }
    }
  },
  assetsDir: 'assets',
  css: process.env.NODE_ENV === 'production' ? { extract: false, sourceMap: false } : {},
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
      config.optimization = {
        // 代码分离
        runtimeChunk: {
          name: entrypoint => `runtime~${entrypoint.name}`
        },
        splitChunks: {
          cacheGroups: {
            default: {
              minSize: 0,
              minChunks: 1,
              chunks: 'async',
              enforce: true,
              reuseExistingChunk: true,
              priority: 10
            },
            vendor: {
              name: 'vendor',
              minSize: 0,
              minChunks: 1,
              priority: 0,
              enforce: true,
              reuseExistingChunk: true,
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/
            }
          }
        }
      }
      config.output = Object.assign(config.output, {
        filename: path.posix.join('js/[name].[contenthash].js'),
        chunkFilename: path.posix.join('js/[name].[contenthash].js')
      })
      config.plugins.push(
        new CompressionPlugin({
          test: /\.js$|\.html$|\.css$/,
          threshold: 10240
        })
      )
    }
    config.resolve.alias = Object.assign(config.resolve.alias, {
      _c: resolve('src/components')
    })
    config.externals = {
      vue: 'Vue',
      vuex: 'Vuex',
      axios: 'axios',
      'vue-router': 'VueRouter'
    }
    // config.plugins.push(new webpack.ProvidePlugin({ _: 'lodash' }))
    config.plugins.push(new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }))
    config.entry.app = ['babel-polyfill', './src/main.js']
  },
  chainWebpack: config => {
    // svg规则配置一下，排除icons目录
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'icon[name]' })
      .end()
    // config.plugin('provide')
    //   .use(webpack.ProvidePlugin, [{
    //     _: 'lodash'
    //   }])
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('prefetch')
      // config.module
      //   .rule('images')
      //   .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      //   .use('image-webpack-loader')
      //   .loader('image-webpack-loader')
      //   .options({ bypassOnDebug: true })
      //   .end()
      if (process.env.VUE_APP_CURRENT_ENV === 'analyzer') {
        config.plugin('webpack-bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/assets/style/common/mixins.less')]
    }
  },
  transpileDependencies: ['vue-socket.io'],
}
