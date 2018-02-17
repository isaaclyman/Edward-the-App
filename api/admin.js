const accountTypes = require('../models/accountType')
const { getUsersOverLimit } = require('./space-used.helper')

module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  const countUsersQuery = accountType =>
    db.knex('users').count('id as count').where('account_type', accountType).then(([{ count }]) => count)

  app.get(route('total-users'), isAdmin, (req, res, next) => {
    Promise.all([
      countUsersQuery(accountTypes.DEMO.name),
      countUsersQuery(accountTypes.LIMITED.name),
      countUsersQuery(accountTypes.PREMIUM.name),
      countUsersQuery(accountTypes.GOLD.name),
      countUsersQuery(accountTypes.ADMIN.name)
    ]).then(([demo, limited, premium, gold, admin]) => {
      res.status(200).send({ demo, limited, premium, gold, admin })
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
