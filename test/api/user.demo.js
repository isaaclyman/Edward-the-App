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
  await createTestUser(app)
  await makeTestUserDemo()
  await serverReady
})

test(`can't modify demo account using APIs`, async t => {
  await app.post(route('user/send-verify-link')).expect(500)
  await app.post(route('user/verify')).expect(500)
  await app.post(route('user/email')).expect(500)
  await app.post(route('user/password')).expect(500)
  await app.post(route('user/upgrade')).expect(500)
  await app.post(route('user/update-payment')).expect(500)
  await app.post(route('user/send-reset-password-link')).expect(500)
})
