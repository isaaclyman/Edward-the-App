const accountTypes = require('../models/accountType')
const { getUsersOverLimit } = require('./space-used.helper')

module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  app.get(route('space-exceeded'), isAdmin, (req, res, next) => {
    const premiumsQuery = getUsersOverLimit(accountTypes.PREMIUM.name, 21000000)
    const goldsQuery = getUsersOverLimit(accountTypes.GOLD.name, 263000000)
    Promise.all([premiumsQuery, goldsQuery]).then(([premiums, golds]) => {
      res.status(200).send({ premiums, golds })
    })
  })
}
