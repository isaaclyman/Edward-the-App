import { app, route, serverReady } from '../_imports'
import request from 'request-promise-native'
import sinon from 'sinon'

const sandbox = sinon.sandbox.create()
const user = { email: 'trash@edwardtheapp.com', password: 'thisismysecurepassword', captchaResponse: 'token' }

beforeAll(() => {
  sandbox.stub(request, 'post')
  .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
  .resolves({ success: false })
})

afterAll(() => {
  sandbox.restore()
})

test('does not log in when captcha fails', async () => {
  await serverReady
  return (
    app.post(route('user/login'))
    .send(user)
    .expect(401)
  )
})

test('does not sign up when captcha fails', async () => {
  await serverReady
  return (
    app.post(route('user/signup'))
    .send(user)
    .expect(401)
  )
})
