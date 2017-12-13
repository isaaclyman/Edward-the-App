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

util.isCorrectPassword = (attempt, realHash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(attempt, realHash).then(isValid => {
      if (isValid) {
        resolve()
      } else {
        reject()
      }
    }, reject)
  })
}

util.addTimestamps = (knex, config, isUpdate) => {
  if (!isUpdate) {
    config['created_at'] = knex.raw('current_timestamp')
  }
  config['updated_at'] = knex.raw('current_timestamp')

  return config
}

module.exports = util
