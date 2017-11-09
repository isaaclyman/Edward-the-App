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

  // Serve user signup, login, logout, verify, and passreset pages
  require('./user')(app, passport, db, isPremiumUser, isLoggedInMiddleware)
  require('./document')(app, passport, db, isPremiumUserMiddleware)
  require('./chapter')(app, passport, db, isPremiumUserMiddleware)

  const premiumTypes = [db.accountTypes.PREMIUM.name, db.accountTypes.GOLD.name, db.accountTypes.ADMIN.name]
  function isPremiumUser (accountType) {
    return premiumTypes.includes(accountType.name)
  }

  function isPremiumUserMiddleware (req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(401).send('Attempted a storage API call without authentication.')
    }

    db.User.findOne({
      where: { id: req.user.id },
      include: [db.AccountType]
    }).then(user => {
      const accountType = user['account_type']

      if (!isPremiumUser(accountType)) {
        res.status(401).send('Attempted a storage API call with a limited account.')
        return
      }
    })

    return next()
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
