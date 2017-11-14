/*
  DOCUMENTS
*/

import uuid from 'uuid/v1'

const addDocument = async (app, name) => {
  const document = {
    id: uuid(),
    name
  }

  await (
    app.post('/api/document/add')
    .send(document)
  )

  return document
}

/*
  TEST USER
*/

const user = { email: 'user.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }

async function createTestUser (defaultApp, app) {
  await (
    (app || defaultApp).post('/api/user/signup')
    .send(user)
    .expect(200)
    .then(response => {
      return response.body
    })
  )

  return user
}

async function deleteTestUser (sequelize) {
  const dbUsers = await sequelize.query(
    `SELECT id FROM users WHERE email = '${user.email}';`,
    { type: sequelize.QueryTypes.SELECT }
  )
  if (dbUsers.length) {
    const userId = dbUsers[0].id
    const tablesToDeleteFrom = [
      'documents', 'document_orders', 'chapters', 'chapter_orders', 'master_topics', 'master_topic_orders',
      'plans', 'plan_orders', 'sections', 'section_orders', 'chapter_topics'
    ]

    tablesToDeleteFrom.forEach(async table => {
      const deleteQuery = `DELETE FROM ${table} WHERE "userId" = ${userId};`
      await sequelize.query(deleteQuery)
    })
  }

  await sequelize.query(`DELETE FROM users WHERE email = '${user.email}';`)
}

async function makeTestUserPremium (sequelize) {
  const query =
  `DO $$
  DECLARE
    premiumId INTEGER;
  BEGIN
    SELECT account_types.id INTO premiumId FROM account_types WHERE name = 'PREMIUM';
    UPDATE users SET "accountTypeId" = premiumId WHERE email = '${user.email}';
  END $$;`

  await sequelize.query(query)
}

/*
  EXTERNAL REQUEST STUBBING
*/

import request from 'request-promise-native'
import sinon from 'sinon'

const stubRecaptcha = (test) => {
  const sandbox = sinon.sandbox.create()

  test.before('stub', t => {
    sandbox.stub(request, 'post')
    .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
    .resolves({ success: true })
  })

  test.after('unstub', t => {
    sandbox.restore()
  })
}

/*
  SUPERTEST WRAPPING
*/

const wrapTest = (t, supertest) => {
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

export {
  addDocument,
  createTestUser,
  deleteTestUser,
  makeTestUserPremium,
  stubRecaptcha,
  wrapTest
}
