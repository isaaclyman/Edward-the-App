const LocalAuth = require('passport-local').Strategy

module.exports = function config (passport, db) {
  const AccountType = db.AccountType
  const accountTypes = db.accountTypes
  const User = db.User

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user)
    }, err => {
      done(err, false)
    })
  })

  /*
    SIGN UP
  */
  passport.use('local-signup', new LocalAuth({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    process.nextTick(() => {
      User.findOne({
        where: {
          email
        }
      }).then(user => {
        if (user) {
          // User already exists
          return done(null, false)
        } else {
          // No user exists; create a new one
          const newUser = new User()
          newUser.email = email
          newUser.password = password

          AccountType.findOne({
            where: { name: accountTypes.LIMITED }
          }).then(({ id }) => {
            newUser.accountTypeId = id
            newUser.save().then(user => {
              return done(null, user)
            }, err => {
              console.log(err)
              return done(err, false)
            })
          })
        }
      }, err => {
        // Db error
        console.log(err)
        return done(null, false)
      })
    })
  }))

  /*
    LOG IN
  */
  passport.use('local-login', new LocalAuth({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    User.findOne({
      where: {
        email
      }
    }).then(user => {
      // Bad username
      if (!user) {
        return done(null, false)
      }

      user.isCorrectPassword(password).then(() => {
        // Correct login
        return done(null, user)
      }, () => {
        // Bad password
        return done(null, false)
      })
    }, err => {
      // Db error
      console.log(err)
      return done(err)
    })
  }))
}
