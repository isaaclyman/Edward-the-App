import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
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
  await makeTestUserPremium()

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

test('access a premium API', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()

  return wrapTest(t,
    app.get('/api/documents')
    .expect(200)
  )
})
