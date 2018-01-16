const accountTypes = require('../models/accountType')
const guid = require('uuid/v4')
const LocalAuth = require('passport-local').Strategy
const util = require('../models/_util')

module.exports = function config (passport, knex) {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    knex('users').where('id', id).first().then(user => {
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
      knex('users').where('email', email).first().then(user => {
        if (user) {
          // User already exists
          return done(null, false)
        }

        // User doesn't exist

        // Generate password hash
        return util.getHash(password).then(hash => {
          // Create new user
          return knex('users').insert(util.addTimestamps(knex, {
            email,
            password: hash,
            'account_type': accountTypes.LIMITED.name,
            verified: false,
            'verify_key': guid()
          })).returning(['id', 'email', 'password', 'account_type', 'verified'])
        }).then(([user]) => {
          return done(null, user)
        }, err => {
          console.log(err)
          return done(err, false)
        })
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
    knex('users').where('email', email).first().then(user => {
      if (!user) {
        // Email doesn't exist
        return done(null, false)
      }

      util.isCorrectPassword(password, user.password).then(() => {
        // Correct login
        return done(null, user)
      }, () => {
        // Bad password
        return done(null, false)
      })
    }, err => {
      console.log(err)
      return done(err)
    })
  }))
}
