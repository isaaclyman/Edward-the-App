const path = require('path')

module.exports = function (app, passport, db) {
  // Serve auth pages
  app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/auth.html'))
  })

  app.get('/login', (req, res) => { res.redirect('/auth') })

  // Serve main app
  app.get('/app', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/app.html'))
  })

  // Serve user signup, login, logout, verify, and passreset pages
  require('./user')(app, passport, db)
  require('./storage')(app, passport, db)
}

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/auth')
}
