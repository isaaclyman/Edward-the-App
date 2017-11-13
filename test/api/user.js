import { app, sequelize, serverReady, test, wrapTest } from '../_imports'
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

test('sign up and log in', async t => {
  await sequelize.query(`DELETE FROM users WHERE email = '${user.email}';`)
  await serverReady
  await (
    app.post(route('signup'))
    .send(user)
    .expect(200)
    .then(response => {
      return response.body
    })
  )

  return wrapTest(t,
    app.post(route('login'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test(`can't log in with wrong password`, t => {
  return sequelize.query(`DELETE FROM users WHERE email = '${user.email}';`).then(
    () => serverReady,
    err => t.fail(err)
  ).then(() => {
    return (
      app.post(route('signup'))
      .send(user)
      .expect(200)
      .then(response => response.body)
    )
  }).then(() => {
    return wrapTest(t,
      app.post(route('login'))
      .send({ email: user.email, password: 'notthecorrectpassword!' })
      .expect(401)
    )
  })
})
