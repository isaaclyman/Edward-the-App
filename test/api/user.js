import {
  app,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'

stubRecaptcha(test)

test('sign up and log in', async t => {
  await deleteTestUser()
  await serverReady
  const user = await createTestUser()
  return wrapTest(t,
    app.post(route('user/login'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('get demo token', async t => {
  await serverReady
  return wrapTest(t,
    app.post(route('user/demo-login'))
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('get current user', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)

  return wrapTest(t,
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      t.is(userRes.email, user.email)
      t.is(userRes.isPremium, false)
      t.is(userRes.accountType.name, 'LIMITED')
    })
  )
})

test(`can't log in with wrong password`, async t => {
  await deleteTestUser()
  await serverReady
  const user = await createTestUser()

  return wrapTest(t,
    app.post(route('user/login'))
    .send({ email: user.email, password: 'notthecorrectpassword!', captchaResponse: 'token' })
    .expect(401)
  )
})
