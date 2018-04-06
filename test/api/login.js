import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  user,
  wrapTest
} from '../_imports'

stubRecaptcha(test)

let app
test.beforeEach(async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
})

test('when there is no login cookie, /login goes to the login page', async t => {
  return wrapTest(t,
    app.get('/login')
    .expect(302)
    .expect('location', '/auth')
  )
})

test('when there is a login cookie for a premium user, /login goes to the app', async t => {
  await createTestUser(app)
  await makeTestUserPremium()
  return wrapTest(t,
    app.get('/login')
    .expect(302)
    .expect('location', '/app')
  )
})

test('when there is a login cookie for a limited user, /login goes to the /limited warning page', async t => {
  await createTestUser(app)
  return wrapTest(t,
    app.get('/login')
    .expect(302)
    .expect('location', '/auth#/limited')
  )
})
