import {
  accountTypes,
  createTestUser,
  deleteTestUser,
  knex,
  stubRecaptcha,
  test,
  user,
  makeTestUserPremium
} from './_imports'

stubRecaptcha(test)

test('delete test user', async t => {
  await deleteTestUser()
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      t.fail()
      return
    }

    t.pass()
  })
})

test('create test user', async t => {
  await deleteTestUser()
  await createTestUser()
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      t.pass()
      return
    }

    t.fail()
  })
})

test('make test user premium', async t => {
  await deleteTestUser()
  await createTestUser()
  await makeTestUserPremium()
  await knex('users').where('email', user.email).first().then(user => {
    if (user['account_type'] === accountTypes.PREMIUM.name) {
      t.pass()
      return
    }

    t.fail()
  })
})
