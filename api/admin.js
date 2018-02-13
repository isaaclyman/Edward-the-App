const accountTypes = require('../models/accountType')
const { getUsersOverLimit } = require('./space-used.helper')

module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  app.get(route('total-users'), isAdmin, (req, res, next) => {
    db.knex('users').count('id').then(([{ count }]) => {
      res.status(200).send({ count })
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('space-overages'), isAdmin, (req, res, next) => {
    const premiumsQuery = getUsersOverLimit(accountTypes.PREMIUM.name, 21000000)
    const goldsQuery = getUsersOverLimit(accountTypes.GOLD.name, 263000000)
    Promise.all([premiumsQuery, goldsQuery]).then(([premiums, golds]) => {
      res.status(200).send({ premiums, golds })
    }, err => {
      res.status(500).send(err)
    })
  })
}
