const accountTypes = require('../models/accountType')
const { getUsersOverLimit } = require('./space-used.helper')

module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  app.get(route('space-used'), isAdmin, (req, res, next) => {
    const premiums = getUsersOverLimit(accountTypes.PREMIUM.name)
    const golds = getUsersOverLimit(accountTypes.GOLD.name)
    res.status(200).send({ premiums, golds })
  })
}