import { serverReady } from '../_imports'
import Email from '../../../api/email.helper'

test('An email can be sent', async done => {
  await serverReady
  const email = new Email(
    ['trash@edwardtheapp.com'],
    'Integration test by test/api/email.js',
    'This is a test email and was probably received in error.' +
    '\nIf you see it more than once, contact support@edwardtheapp.com.'
  )
  
  return email.send().then(info => {
    expect(info.messageId).toBeTruthy()
    done()
  }, err => {
    done.fail(`Email failed to send: ${err}`)
  });
})
