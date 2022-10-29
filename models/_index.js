const accountTypes = require('./accountType')
const ts = require('./_util').addTimestamps

module.exports = function (knex) {
  const db = {
    knex,
    DemoUser: null
  }

  // Run all migrations that have not been run
  // Then make sure the demo user exists
  const demoEmail = 'demo@edwardtheapp.com'
  const dbReady = Promise.resolve().then(() => {
    return (
      knex('users').where('email', demoEmail).first()
    )
  }).then(user => {
    if (user) {
      return user
    }

    return (
      knex('users').insert(ts(knex, {
        email: demoEmail,
        password: 'DEMO',
        'account_type': accountTypes.DEMO.name,
        verified: true
      })).returning(['id', 'email', 'password', 'account_type']).then(([user]) => user)
    )
  }).then(user => {
    db.DemoUser = user
  })

  return { db, dbReady }
}
