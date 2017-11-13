import { app, getPersistentAgent, sequelize, serverReady, test, wrapTest } from '../_imports'
import request from 'request-promise-native'
import sinon from 'sinon'

const route = route => `/api/user/${route}`
const sandbox = sinon.sandbox.create()
const user = { email: 'user.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }

test.before('stub', t => {
  sandbox.stub(request, 'post')
  .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
  .resolves({ success: true })
})

test.after('unstub', t => {
  sandbox.restore()
})

async function deleteTestUser () {
  await sequelize.query(`DELETE FROM users WHERE email = '${user.email}';`)
}

async function createTestUser (overrideApp) {
  await (
    (overrideApp || app).post(route('signup'))
    .send(user)
    .expect(200)
    .then(response => {
      return response.body
    })
  )
}

test('sign up and log in', async t => {
  await deleteTestUser()
  await serverReady
  await createTestUser()
  return wrapTest(t,
    app.post(route('login'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('get demo token', async t => {
  await serverReady
  return wrapTest(t,
    app.post(route('demo-login'))
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('get current user', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)

  return wrapTest(t,
    app.get(route('current'))
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
  await createTestUser()

  return wrapTest(t,
    app.post(route('login'))
    .send({ email: user.email, password: 'notthecorrectpassword!', captchaResponse: 'token' })
    .expect(401)
  )
})
