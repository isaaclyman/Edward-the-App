import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserDemo,
  route,
  serverReady,
  stubRecaptcha,
  test,
  user,
  wrapTest
} from '../_imports'

stubRecaptcha(test)

let app
test.beforeEach('set up demo user', async t => {
  app = getPersistentAgent()
  await deleteTestUser()
  await createTestUser()
  await makeTestUserDemo()
  await serverReady
})

test(`can't modify the demo account using the APIs`, async t => {
  await [
    route('user/send-verify-link'),
    route('user/verify'),
    route('user/email'),
    route('user/password'),
    route('user/upgrade'),
    route('user/update-payment')
  ].forEach(async endpoint => {
    await app.post(endpoint).expect(500)
  })
})
