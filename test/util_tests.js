import {
  accountTypes,
  knex,
  stubRecaptcha,
  test,
  user
} from './_imports'
import {
  createTestUser,
  deleteTestUser,
  makeTestUserPremium
} from './_util'

stubRecaptcha(test)

test('delete test user', async t => {
  await deleteTestUser(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      t.fail()
      return
    }

    t.pass()
  })
})

test('create test user', async t => {
  await deleteTestUser(knex)
  await createTestUser(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      t.pass()
      return
    }

    t.fail()
  })
})

test('get test user by id', async t => {
  await deleteTestUser(knex)
  const user = await createTestUser(knex)
  await knex('users').where('id', user.id).first().then(user => {
    if (user) {
      t.pass()
      return
    }

    t.fail()
  })
})

test('make test user premium', async t => {
  await deleteTestUser(knex)
  await createTestUser(knex)
  await makeTestUserPremium(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user['account_type'] === accountTypes.PREMIUM.name) {
      t.pass()
      return
    }

    t.fail()
  })
})
