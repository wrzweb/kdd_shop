const path = require('path');
module.exports = {
  lintOnSave: false,//禁用掉eslint
  chainWebpack: config => {
    config.entryPoints.delete('app')//把默认配置项入口删掉
    config.when(process.env.NODE_ENV == 'production', config => {
      console.log('生产环境')
      config.entry('app').add('./src/main-prod.js')
      //html-webpack-plugin
      config
        .plugin('html')
        .tap(args => {
          args[0].template = path.join(__dirname, '/public/index-prod.html')
          return args
        })

      //externals是排除的意思
      //当你把如下的这些第三方库或框架设置好之后，打包的时候，不会在app.js当中包含这些文件
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
    })
    config.when(process.env.NODE_ENV == 'development', config => {
      console.log('开发环境')
      config.entry('app').add('./src/main-dev.js')
      config
        .plugin('html')
        .tap(args => {
          args[0].template = path.join(__dirname, '/public/index-dev.html')
          return args
        })
    })
  }
}
