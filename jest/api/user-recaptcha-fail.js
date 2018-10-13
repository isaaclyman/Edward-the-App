import { app, route, serverReady } from '../_imports'
import request from 'request-promise-native'

const user = { email: 'trash@edwardtheapp.com', password: 'thisismysecurepassword', captchaResponse: 'token' }

beforeAll(() => {
  const oldPost = request.post
  jest.spyOn(request, 'post').mockImplementation(body => {
    if (body.uri === 'https://www.google.com/recaptcha/api/siteverify') {
      return Promise.resolve({ success: false })
    }
    return oldPost.apply([...arguments])
  })
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
