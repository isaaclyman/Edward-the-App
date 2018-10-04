const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']

module.exports = {
  assetsDir: 'static',
  pages: {
    app: {
      entry: 'src/app.js',
      template: 'public/app.html',
      filename: 'app.html',
    },
    auth: {
      entry: 'src/auth.js',
      template: 'public/auth.html',
      filename: 'auth.html',
    },
    admin: {
      entry: 'src/admin.js',
      template: 'public/admin.html',
      filename: 'admin.html',
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    before: function (app) {
      app.get('/app', function (req, res) { res.redirect('/app.html') })
      app.get('/auth', function (req, res) { res.redirect('/auth.html') })
      app.get('/login', function (req, res) { res.redirect('/auth.html') })
      app.get('/admin', function (req, res) { res.redirect('/admin.html') })
      app.get('/press', function (req, res) { res.redirect('/press/press.html') })
    }
  },
  configureWebpack: {
    plugins: [
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      })
    ]
  },
  chainWebpack: config => {
    config.plugin('copy')
      .tap(args => {
        args[0][0].ignore = [
          '.DS_Store',
          'public/app.html',
          'public/auth.html',
          'public/admin.html'
        ]
        return args
      })
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    name: 'Edward the App',
    themeColor: '#BFEADA',
    assetsVersion: '20181003'
  }
}
