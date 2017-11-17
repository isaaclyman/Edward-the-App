import util from '../models/_util'

/*
  ROUTES
*/

const route = route => `/api/${route}`

/*
  TEST USER
*/

export const user = { email: 'user.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }

function createTestUser (sequelize) {
  return util.getHash(user.password).then(hash => {
    const query =
    `DO $$
    DECLARE
      limitedId INTEGER;
    BEGIN
      SELECT account_types.id INTO limitedId FROM account_types WHERE name = 'LIMITED';
      INSERT INTO users (email, password, "accountTypeId", "createdAt", "updatedAt")
        VALUES ('${user.email}', '${hash}', limitedId, current_timestamp, current_timestamp);
    END $$;`

    return sequelize.query(query)
  })
}

function deleteTestUser (sequelize) {
  return sequelize.query(
    `SELECT id FROM users WHERE email = '${user.email}';`,
    { type: sequelize.QueryTypes.SELECT }
  ).then(dbUsers => {
    if (!dbUsers.length) {
      return
    }
    const userId = dbUsers[0].id
    const tablesToDeleteFrom = [
      'documents', 'document_orders', 'chapters', 'chapter_orders', 'master_topics', 'master_topic_orders',
      'plans', 'plan_orders', 'sections', 'section_orders', 'chapter_topics'
    ]

    const deletePromises = tablesToDeleteFrom.map(table => {
      const deleteQuery = `DELETE FROM ${table} WHERE "userId" = ${userId};`
      return sequelize.query(deleteQuery)
    })

    return Promise.all(deletePromises)
  }).then(() => {
    return sequelize.query(`DELETE FROM users WHERE email = '${user.email}';`)
  })
}

function makeTestUserPremium (sequelize) {
  const query =
  `DO $$
  DECLARE
    premiumId INTEGER;
  BEGIN
    SELECT account_types.id INTO premiumId FROM account_types WHERE name = 'PREMIUM';
    UPDATE users SET "accountTypeId" = premiumId WHERE email = '${user.email}';
  END $$;`

  return sequelize.query(query)
}

/*
  EXTERNAL REQUEST STUBBING
*/

import request from 'request-promise-native'
import sinon from 'sinon'

const stubRecaptcha = (test) => {
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
  createTestUser,
  deleteTestUser,
  makeTestUserPremium,
  route,
  stubRecaptcha,
  wrapTest
}
