import {
  app,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  sequelize,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'

const route = route => `/api/user/${route}`

stubRecaptcha(test)

test('log in as premium user', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)

  const query =
  `DO $$
  DECLARE
    premiumId INTEGER;
  BEGIN
    SELECT account_types.id INTO premiumId FROM account_types WHERE name = 'PREMIUM';
    UPDATE users SET "accountTypeId" = premiumId WHERE email = '${user.email}';
  END $$;`

  await sequelize.query(query)

  return wrapTest(t,
    app.get(route('current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      t.is(userRes.email, user.email)
      t.is(userRes.isPremium, true)
      t.is(userRes.accountType.name, 'PREMIUM')
    })
  )
})
