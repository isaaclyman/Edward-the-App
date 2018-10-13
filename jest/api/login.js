import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  serverReady,
  stubRecaptcha
} from '../_imports'

stubRecaptcha(test)

let app
beforeEach(async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
})

test('when there is no login cookie, /login goes to the login page', async () => {
  return (
    app.get('/login')
    .expect(302)
    .expect('location', '/auth')
  )
})

test('when there is a login cookie for a premium user, /login goes to the app', async () => {
  await createTestUser(app)
  await makeTestUserPremium()
  return (
    app.get('/login')
    .expect(302)
    .expect('location', '/app')
  )
})

test('when there is a login cookie for a limited user, /login goes to the /limited warning page', async () => {
  await createTestUser(app)
  return (
    app.get('/login')
    .expect(302)
    .expect('location', '/auth#/limited')
  )
})
