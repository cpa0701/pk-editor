'use strict'
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
module.exports = {
  // 修改 src 目录 为 examples 目录
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack: config => {
    config.module
      .rule('js')
      .include
      .add(resolve('packages'))
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        // 修改它的选项...
        return options
      })
  }
}
