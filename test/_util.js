import request from 'request-promise-native'
import sinon from 'sinon'

const stubRecaptcha = (test) => {
  const sandbox = sinon.sandbox.create()

  test.before('stub', t => {
    sandbox.stub(request, 'post')
    .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
    .resolves({ success: true })
  })

  test.after('unstub', t => {
    sandbox.restore()
  })
}

const wrapTest = (t, supertest) => {
  return new Promise((resolve, reject) => {
    supertest.end((err, res) => {
      if (err) {
        t.fail(err)
        return reject()
      }
      t.pass()
      return resolve()
    })
  })
}

export { stubRecaptcha, wrapTest }
