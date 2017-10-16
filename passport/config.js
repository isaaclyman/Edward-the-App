const LocalAuth = require('passport-local').Strategy
const User = require('../models/user')

module.exports = function config (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  passport.use('local-signup', new LocalAuth({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    process.nextTick(() => {
      User.findOne({ 'email': email }, (err, user) => {
        if (err) {
          return done(err)
        }

        if (user) {
          return done(null, false)
        } else {
          const newUser = new User()
          newUser.email = email
          newUser.password = password

          newUser.save((err) => {
            if (err) {
              throw err
            }

            return done(null, newUser)
          })
        }
      })
    })
  }))
}
