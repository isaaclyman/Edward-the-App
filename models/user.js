const bcrypt = require('bcryptjs')

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [3, 100]
      }
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })

  User.prototype.isCorrectPassword = function (attempt) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(attempt, this.password).then(isValid => {
        if (isValid) {
          resolve()
        } else {
          reject()
        }
      }, reject)
    })
  }

  User.beforeCreate((user, options) => {
    return getHash(user.password).then(hash => {
      user.password = hash
    }).catch(err => {
      console.log(err)
    })
  })

  return User
}

function getHash (password) {
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
