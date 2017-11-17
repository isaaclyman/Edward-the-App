const bcrypt = require('bcryptjs')

const util = {}

util.getHash = password => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err)
        return
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err)
          return
        }

        resolve(hash)
        return
      })
    })
  })
}

module.exports = util
