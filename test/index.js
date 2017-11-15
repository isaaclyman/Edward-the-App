import { app, createTestUser, deleteTestUser, getPersistentAgent, serverReady, test, wrapTest } from './_imports'

test('redirects from http to https on auth page', async t => {
  await serverReady
  return wrapTest(t,
    app.get('/auth')
    .set('Host', 'edwardtheapp.com')
    .expect(302)
    .expect('location', 'https://edwardtheapp.com/auth')
  )
})

test('gets auth page', async t => {
  return wrapTest(t,
    app.get('/')
    .expect(200)
    .expect(/<title>Edward/)
    .expect(/<body>/)
  )
})

test('gets app page', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  return wrapTest(t,
    app.get('/app')
    .expect(200)
    .expect(/<title>Edward/)
    .expect(/<body>/)
  )
})
