const path = require('path')

module.exports = function (app, passport, db) {
  // Serve auth pages
  app.get('/auth', httpsMiddleware, (req, res) => {
    req.logout()
    res.sendFile(path.join(__dirname, '../dist/auth.html'))
  })

  app.get('/login', (req, res) => { res.redirect('/auth') })

  // Serve main app
  app.get('/app', httpsMiddleware, isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/app.html'))
  })

  // Serve user signup, login, logout, verify, and passreset pages
  require('./user')(app, passport, db, isLoggedIn)
  require('./document')(app, passport, db)
}

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/auth')
}

function httpsMiddleware (req, res, next) {
  const host = req.get('host')
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')

  if (req.protocol !== 'https' && !isLocal) {
    res.redirect(`https://${host}${req.originalUrl}`)
    return
  }

  return next()
}
