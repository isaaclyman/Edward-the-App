import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'

stubRecaptcha(test)

test('log in as premium user', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)
  await makeTestUserPremium()

  return wrapTest(t,
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      t.is(userRes.email, user.email)
      t.is(userRes.isPremium, true)
      t.is(userRes.accountType.name, 'PREMIUM')
    })
  )
})

test('access a premium API', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()

  return wrapTest(t,
    app.get(route('documents'))
    .expect(200)
  )
})
