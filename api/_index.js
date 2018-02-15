const accountTypes = require('../models/accountType')
const path = require('path')

module.exports = function (app, passport, db) {
  // Serve auth pages
  app.get('/auth', httpsMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/auth.html'))
  })

  app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/app')
    } else {
      return res.redirect('/auth')
    }
  })

  // Serve main app
  app.get('/app', httpsMiddleware, isLoggedInMiddleware, isNotOverdueMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/app.html'))
  })

  // Serve admin page
  app.get('/admin', httpsMiddleware, isAdminMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/admin.html'))
  })

  // Serve user-facing APIs
  require('./user')(app, passport, db, isPremiumUser, isOverdue, isLoggedInMiddleware, isNotDemoMiddleware)
  require('./document').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./backup').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./chapter').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./topic').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./plan').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./section').registerApis(app, passport, db, isPremiumUserMiddleware)
  require('./payments.events').registerApis(app, db)

  // Serve admin-facing APIs
  require('./admin')(app, passport, db, isAdminMiddleware)
}

const premiumTypes = [accountTypes.PREMIUM.name, accountTypes.GOLD.name, accountTypes.ADMIN.name]
function isPremiumUser (accountType) {
  return premiumTypes.includes(accountType)
}

function isAdmin (accountType) {
  return accountType === accountTypes.ADMIN.name
}

function isAdminMiddleware (req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).send('Attempted an admin API call without authentication.')
    return
  }

  if (!isAdmin(req.user.account_type)) {
    res.status(401).send('Attempted an admin API call without an admin account.')
    return
  }

  return next()
}

function isNotDemoMiddleware (req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }

  if (req.user.account_type === accountTypes.DEMO.name) {
    return res.status(500).send('Cannot perform this action with a Demo account.')
  }

  return next()
}

function isPremiumUserMiddleware (req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).send('Attempted a premium API call without authentication.')
    return
  }

  if (!isPremiumUser(req.user.account_type)) {
    res.status(401).send('Attempted a premium API call with a limited account.')
    return
  }

  return next()
}

function isLoggedInMiddleware (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/auth')
}

function isOverdue (user) {
  const dueDate = user.payment_period_end
  return !dueDate || (addDays(dueDate, 5) < Date.now())
}

function isNotOverdueMiddleware (req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).send('Attempted an API call without authentication.')
    return
  }

  if (!isPremiumUser(req.user.account_type)) {
    return next()
  }

  if (isOverdue(req.user)) {
    res.redirect('/auth#/account')
    return
  }

  return next()
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
