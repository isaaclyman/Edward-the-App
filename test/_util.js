const accountTypes = require('../models/accountType')
const modelUtil = require('../models/_util')
const util = {}

/*
  ROUTES
*/

const route = route => `/api/${route}`
util.route = route

/*
  TEST USER
*/

const user = { email: 'user.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }
util.user = user

util.createTestUser = function (knex) {
  return modelUtil.getHash(user.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: user.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

util.deleteTestUser = function (knex, email) {
  email = email || user.email

  return (
    knex('users').where('email', email).first('id').then(testUser => {
      if (testUser === undefined) {
        return
      }

      const testUserId = testUser.id

      const tablesToDeleteFrom = [
        'section_orders', 'sections', 'plan_orders', 'plans', 'chapter_topics', 'master_topic_orders',
        'master_topics', 'chapter_orders', 'chapters', 'document_orders', 'documents'
      ]

      const deleteFns = tablesToDeleteFrom.map(table => () => {
        return knex(table).where('user_id', testUserId).del()
      })

      return orderPromises(deleteFns)
    }).then(() => knex('users').where('email', email).del())
  )
}

function orderPromises (promiseFns) {
  if (!promiseFns[0]) {
    return Promise.resolve()
  }

  return promiseFns[0]().then(() => {
    if (promiseFns.length > 1) {
      promiseFns.splice(0, 1)
      return orderPromises(promiseFns)
    } else {
      return promiseFns[0]()
    }
  })
}

util.makeTestUserPremium = function (knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.PREMIUM.name
    })
  )
}

/*
  EXTERNAL REQUEST STUBBING
*/

const request = require('request-promise-native')
const sinon = require('sinon')

util.stubRecaptcha = function (test) {
  const sandbox = sinon.sandbox.create()

  test.before('stub recaptcha request', t => {
    sandbox.stub(request, 'post')
    .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
    .resolves({ success: true })
  })

  test.after('unstub recaptcha request', t => {
    sandbox.restore()
  })
}

/*
  SUPERTEST WRAPPING
*/

util.wrapTest = function (t, supertest) {
  return new Promise((resolve, reject) => {
    supertest.end((err, res) => {
      if (err) {
        t.fail(err)
        return reject()
      }
      return resolve()
    })
  })
}

module.exports = util
