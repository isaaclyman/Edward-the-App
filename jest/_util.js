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
  stripeId: 'cus_test',
  verifyKey: '5cf197a4-1029-4250-91cc-6f0ef75bca77'
}

const alternateUser = {}
Object.assign(alternateUser, user, { email: 'trash2@edwardtheapp.com' })

function getTestUserId (knex) {
  return knex('users').where('email', user.email).first('id').then(({ id }) => id)
}

function createTestUser (knex) {
  return modelUtil.getHash(user.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: user.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name,
        verified: true,
        payment_period_end: knex.raw(`(SELECT 'now'::timestamp + '1 days'::interval)`)
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

function createAlternateTestUser (knex) {
  return modelUtil.getHash(alternateUser.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: alternateUser.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name,
        verified: true,
        payment_period_end: knex.raw(`(SELECT 'now'::timestamp + '1 days'::interval)`)
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

function createTestDocument (knex, overrideEmail = null) {
  const docGuid1 = guid()
  const docGuid2 = guid()

  const userQuery = `(SELECT id FROM users WHERE email = '${overrideEmail || user.email}' LIMIT 1)`
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
  }).then(() => ([docGuid1, docGuid2]))
}

function createTestChapter (knex) {
  const chapGuids = [guid(), guid(), guid()]

  const userQuery = `(SELECT id FROM users WHERE email = '${user.email}' LIMIT 1)`
  const userId = knex.raw(userQuery)
  const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

  const chapter = (index) => ({
    archived: false,
    content: { ops: [{ insert: 'test chapter content searchable' }] },
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

function deleteTestUser(knex, email, deleteContentOnly = false) {
  email = email || user.email

  return (
    knex('users').where('email', email).first('id').then(testUser => {
      if (testUser === undefined) {
        return
      }

      const testUserId = testUser.id

      const tablesToDeleteFrom = [
        'section_orders', 'sections', 'plan_orders', 'plans', 'chapter_topics', 'master_topic_orders',
        'master_topics', 'chapter_orders', 'chapters', 'document_orders', 'documents', 'workshop_content'
      ]

      const deleteFns = tablesToDeleteFrom.map(table => () => {
        return knex(table).where('user_id', testUserId).del()
      })

      return orderPromises(deleteFns)
    }).then(() => {
      if (deleteContentOnly) {
        return
      }
      return knex('users').where('email', email).del()
    })
  )
}

function getDocuments(knex, email) {
  const userQuery = `(SELECT id FROM users WHERE email = '${email}' LIMIT 1)`
  const userId = knex.raw(userQuery)

  return knex('documents').where('user_id', userId).select()
}

function makeTestUserAdmin(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.ADMIN.name
    })
  )
}

function makeTestUserDemo(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.DEMO.name
    })
  )
}

function makeTestUserPremium(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.PREMIUM.name,
      'payment_period_end': knex.raw(`(SELECT 'now'::timestamp + '1 month'::interval)`)
    })
  )
}

function setTestUserPaymentDueDate(knex, daysFromNow) {
  return (
    knex('users').where('email', user.email).update({
      'payment_period_end': knex.raw(`(SELECT 'now'::timestamp + '${daysFromNow} days'::interval)`)
    })
  )
}

function setTestUserStripeId(knex) {
  return (
    knex('users').where('email', user.email).update({
      'stripe_customer_id': user.stripeId
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

function stubRecaptcha() {
  beforeAll(() => {
    const oldPost = request.post
    jest.spyOn(request, 'post').mockImplementation(body => {
      if (body.uri === 'https://www.google.com/recaptcha/api/siteverify') {
        return Promise.resolve({ success: true })
      }
      return oldPost.apply([...arguments])
    })
  })
}

/*
  GUIDS
*/

const workshopGuids = ['7f796320-3f2d-11e8-9fe0-af1b5e8b1c51', '7f796321-3f2d-11e8-9fe0-af1b5e8b1c51']

module.exports = {
  user,
  alternateUser,
  createTestUser,
  createAlternateTestUser,
  createTestDocument,
  createTestChapter,
  deleteTestUser,
  getDocuments,
  getTestUserId,
  makeTestUserAdmin,
  makeTestUserDemo,
  makeTestUserPremium,
  route,
  setTestUserPaymentDueDate,
  setTestUserResetKey,
  setTestUserStripeId,
  setTestUserVerifyKey,
  stubRecaptcha,
  workshopGuids
}
