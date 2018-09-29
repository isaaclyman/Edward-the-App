module.exports = {
  assetsDir: 'static',
  pages: {
    app: {
      entry: 'src/app.js',
      template: 'public/app.html',
      filename: 'app.html',
      chunks: [],
    },
    auth: {
      entry: 'src/auth.js',
      template: 'public/auth.html',
      filename: 'auth.html',
      chunks: [],
    },
    admin: {
      entry: 'src/admin.js',
      template: 'public/admin.html',
      filename: 'admin.html',
      chunks: [],
    },
  },
}
