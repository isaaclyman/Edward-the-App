const accountTypes = require('../models/accountType')
const path = require('path')

module.exports = function (app, passport, db) {
  // Serve auth pages
  app.get('/auth', httpsMiddleware, (req, res) => {
    req.logout()
    res.sendFile(path.join(__dirname, '../dist/auth.html'))
  })

  app.get('/login', (req, res) => { res.redirect('/auth') })

  // Serve main app
  app.get('/app', httpsMiddleware, isLoggedInMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/app.html'))
  })

  // Serve user-facing APIs
  require('./user')(app, passport, db, isPremiumUser, isLoggedInMiddleware)
  require('./document')(app, passport, db, isPremiumUserMiddleware)
  require('./backup')(app, passport, db, isPremiumUserMiddleware)
  require('./chapter').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./topic').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./plan').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./section').registerApis(app, passport, db, isPremiumUserMiddleware)

  // Serve admin-facing APIs
  require('./admin')(app, passport, db, isAdminMiddleware)

  function isAdmin (accountType) {
    return accountType === accountTypes.ADMIN.name
  }

  function isAdminMiddleware (req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(401).send('Attempted an admin API call without authentication.')
      return
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      if (!user) {
        res.status(500).send('User does not exist.')
        return
      }

      if (!isAdmin(user['account_type'])) {
        res.status(401).send('Attempted an admin API call without an admin account.')
        return
      }

      return next()
    })
  }

  const premiumTypes = [accountTypes.PREMIUM.name, accountTypes.GOLD.name, accountTypes.ADMIN.name]
  function isPremiumUser (accountType) {
    return premiumTypes.includes(accountType)
  }

  function isPremiumUserMiddleware (req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(401).send('Attempted a premium API call without authentication.')
      return
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      if (!user) {
        res.status(500).send('User does not exist.')
        return
      }

      if (!isPremiumUser(user['account_type'])) {
        res.status(401).send('Attempted a premium API call with a limited account.')
        return
      }

      return next()
    })
  }
}

function isLoggedInMiddleware (req, res, next) {
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
