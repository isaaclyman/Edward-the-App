const accountTypes = require('../models/accountType')
const guid = require('uuid/v1')
const modelUtil = require('../models/_util')
const orderPromises = require('../utilities').orderPromises

/*
  ROUTES
*/

const route = route => `/api/${route}`

/*
  TEST USER
*/

const user = {
  email: 'trash@edwardtheapp.com',
  password: 'thisismysecurepassword',
  captchaResponse: 'token',
  resetKey: '5cf197a4-1029-4250-91cc-6f0ef75bca77',
  verifyKey: '5cf197a4-1029-4250-91cc-6f0ef75bca77'
}

function createTestUser (knex) {
  return modelUtil.getHash(user.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: user.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name,
        verified: true
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

function createTestDocument (knex) {
  const docGuid1 = guid()
  const docGuid2 = guid()

  const userQuery = `(SELECT id FROM users WHERE email = '${user.email}' LIMIT 1)`
  const userId = knex.raw(userQuery)

  return knex('documents').insert([{
    guid: docGuid1,
    name: 'test',
    'user_id': userId
  }, {
    guid: docGuid2,
    name: 'test2',
    'user_id': userId
  }]).then(() => {
    return knex('document_orders').insert({
      order: JSON.stringify([docGuid1, docGuid2]),
      'user_id': userId
    })
  })
}

function createTestChapter (knex) {
  const chapGuids = [guid(), guid(), guid()]

  const userQuery = `(SELECT id FROM users WHERE email = '${user.email}' LIMIT 1)`
  const userId = knex.raw(userQuery)
  const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

  const chapter = (index) => ({
    archived: false,
    content: null,
    guid: chapGuids[index - 1],
    title: `test chapter ${index}`,
    'user_id': userId,
    'document_id': docId
  })

  return knex('chapters').insert([chapter(1), chapter(2), chapter(3)]).then(() => {
    return knex('chapter_orders').insert({
      order: JSON.stringify(chapGuids),
      'document_id': docId,
      'user_id': userId
    })
  })
}

function deleteTestUser(knex, email) {
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

function makeTestUserAdmin(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.ADMIN.name
    })
  )
}

function makeTestUserPremium(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.PREMIUM.name
    })
  )
}

function setTestUserVerifyKey(knex) {
  return (
    knex('users').where('email', user.email).update({
      'verify_key': user.verifyKey
    })
  )
}

function setTestUserResetKey(knex) {
  return (
    modelUtil.getHash(user.resetKey).then(hash => {
      return knex('users').where('email', user.email).update({
        'pass_reset_key': hash
      })
    })
  )
}

/*
  EXTERNAL REQUEST STUBBING
*/

const request = require('request-promise-native')
const sinon = require('sinon')

function stubRecaptcha(test) {
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

function wrapTest(t, supertest) {
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

module.exports = {
  user,
  createTestUser,
  createTestDocument,
  createTestChapter,
  deleteTestUser,
  makeTestUserAdmin,
  makeTestUserPremium,
  route,
  setTestUserResetKey,
  setTestUserVerifyKey,
  stubRecaptcha,
  wrapTest
}
