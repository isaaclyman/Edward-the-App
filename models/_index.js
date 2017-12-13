const accountTypes = require('./accountType')
const util = require('./_util')

module.exports = function (knex) {
  const db = {
    knex,
    DemoUser: null
  }

  // Run all migrations that have not been run
  // Then make sure the demo user exists
  const demoEmail = 'demo@edwardtheapp.com'
  const dbReady = knex.migrate.latest().then(() => {
    return (
      knex('users').where('email', demoEmail).first()
    )
  }).then(user => {
    if (user) {
      return user
    }

    return (
      knex('users').insert(util.addTimestamps(knex, {
        email: demoEmail,
        password: 'DEMO',
        'account_type': accountTypes.DEMO.name
      })).returning(['id', 'email', 'password', 'account_type']).then(([user]) => user)
    )
  }).then(user => {
    db.DemoUser = user
  })

  return { db, dbReady }
}
