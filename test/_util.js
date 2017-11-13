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

export default wrapTest
