const accountTypes = require('../models/accountType')
const Email = require('./email.helper')
const modelUtil = require('../models/_util')
const payments = require('./payments.helper')
const request = require('request-promise-native')
const ts = modelUtil.addTimestamps
const uuid = require('uuid/v4')

// This file deals with sensitive user data. Therefore, error messages (which could contain that data)
//  are not included in any response to the front end.

module.exports = function (app, passport, db, isPremiumUser, isOverdue, isLoggedInMiddleware, isNotDemoMiddleware, isVerifiedMiddleware) {
  const route = route => `/api/user/${route}`

  const verifyCaptchaToken = (req) => {
    const token = req.body && req.body.captchaResponse
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject()
      }

      const postOptions = {
        method: 'POST',
        uri: 'https://www.google.com/recaptcha/api/siteverify',
        formData: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
          remoteip: req.ip
        },
        json: true
      }

      request.post(postOptions).then((response) => {
        if (response.success) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }

  const captchaMiddleware = (req, res, next) => {
    if (req.body && req.body.email && req.body.email.endsWith('@edwardtheapp.com') && req.body.integration === true) {
      return next()
    }

    verifyCaptchaToken(req).then(() => {
      return next()
    }, () => {
      res.status(401).send('Captcha failed.')
    })
  }

  const getUserResponse = user => {
    return new Promise((resolve, reject) => {
      db.knex('users').where('id', user.id).first(
        'account_type', 'email', 'verified', 'payment_period_end'
      ).then(user => {
        const accountType = user['account_type']
        resolve({
          accountType: accountTypes[accountType],
          email: user.email,
          isOverdue: isOverdue(user),
          isPremium: isPremiumUser(accountType),
          paymentDue: user.payment_period_end,
          verified: user.verified
        })
      }, err => {
        console.error(err)
        reject()
      })
    })
  }

  app.get(route('current'), isLoggedInMiddleware, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    getUserResponse(req.user).then(response => {
      res.status(200).send(response)
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('signup'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Signup failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send()
      })
    })(req, res, next)
  })

  app.post(route('login'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-login', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Authentication failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send({
          isPremium: isPremiumUser(user.account_type),
          verified: user.verified
        })
      })
    })(req, res, next)
  })

  app.post(route('demo-login'), (req, res, next) => {
    req.login(db.DemoUser, err => {
      if (err) {
        return next(err)
      }

      return res.status(200).send()
    })
  })

  app.post(route('send-verify-link'), isLoggedInMiddleware, isNotDemoMiddleware, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      const key = user['verify_key']
      return new Email(
        [user.email],
        'Verify your account',
        'Thanks for signing up for an account with Edward. Use the link below to verify your email address:' +
        `\n\n${process.env.BASE_URL}/auth#/verify/${encodeURIComponent(user.email)}/${key}`
      ).send()
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('verify'), isNotDemoMiddleware, (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(401).send('Email and verification key must be provided.')
      return
    }

    db.knex('users').where({
      email,
      verified: false,
      'verify_key': key
    }).first().then(user => {
      if (!user || !user['verify_key']) {
        res.status(401).send('Email address or verification key is incorrect.')
        return false
      }

      return db.knex('users').where('id', user.id).update(ts(db.knex, {
        verified: true,
        'verify_key': null
      }, true)).then(() => {
        req.login(user, err => {
          if (err) {
            console.error(err)
            res.status(500).send('An error occurred while logging in.')
            return false
          }

          return res.status(200).send()
        })
      }).then(() => {
        return new Email(
          [email],
          'Your Edward account is verified',
          'Thanks for verifying your email address! Now you can log in and start writing.' +
          '\n\nWe hope you\'ll enjoy Edward and tell your friends about it.' +
          '\n\nOnce you\'ve had a chance to try it out, could you give us some feedback? Take our survey ' +
          'at https://goo.gl/forms/saXggUzUs6PtScRH3 and let us know how Edward can make your dreams come true.' +
          '\n\nIf you ever want to upgrade, change or delete your account, you can visit ' +
          'https://edwardtheapp.com/auth#/account.' +
          '\n\nThanks again and happy writing!'
        )
      })
    }).then(undefined, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.get(route('logout'), (req, res, next) => {
    req.logout()
    res.status(200).send()
  })

  app.post(route('email'), isLoggedInMiddleware, isNotDemoMiddleware, (req, res, next) => {
    const newEmail = req.body.email

    return db.knex('users').where('email', newEmail).first().then(existingUser => {
      if (existingUser) {
        res.status(500).send('This email address is unavailable.')
        return false
      }

      return (
        db.knex('users').where('id', req.user.id).update(ts(db.knex, {
          email: newEmail,
          verified: false,
          'verify_key': uuid()
        }, true))
      )
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('password'), isLoggedInMiddleware, isNotDemoMiddleware, (req, res, next) => {
    return modelUtil.getHash(req.body.password).then(hash => {
      return db.knex('users').where('id', req.user.id).update(ts(db.knex, {
        password: hash
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { oldAccountType, newAccountType, token }
  app.post(route('upgrade'), isLoggedInMiddleware, isNotDemoMiddleware, isVerifiedMiddleware, (req, res, next) => {
    const { oldAccountType, newAccountType, token } = req.body

    // Verify that the user isn't trying to make themself an Admin
    if (newAccountType === accountTypes.ADMIN.name) {
      const err = new Error('Cannot upgrade to an Admin account using this API.')
      return res.status(401).send()
    }

    // Verify that if a paid account is being requested, a payment token is included
    if ([accountTypes.PREMIUM.name, accountTypes.GOLD.name].includes(newAccountType) && !token) {
      const err = new Error('Cannot upgrade to a paid account without a payment token.')
      return res.status(500).send()
    }

    // Verify that oldAccountType and newAccountType are valid account type names
    const typeNames = Object.values(accountTypes).map(type => type.name)
    if (!typeNames.includes(oldAccountType) || !typeNames.includes(newAccountType)) {
      const err = new Error(`One of received account types is not valid. Received: ${oldAccountType}, ${newAccountType}`)
      return res.status(500).send()
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      if (!user) {
        throw new Error('Current user was not found.')
      }
      
      if (user.account_type !== oldAccountType) {
        res.status(500).send(`Received oldAccountType does not match the user's actual account type.`)
        throw new Error()
      }

      return payments.setSubscription(
        user.email,
        user.stripe_customer_id,
        payments.planIds[newAccountType],
        token,
        db.knex
      )
    }).then(() => {
      return db.knex('users').where('id', req.user.id).update(ts(db.knex, {
        'account_type': newAccountType,
        'payment_period_end': db.knex.raw(`(SELECT 'now'::timestamp + '1 month'::interval)`)
      }, true))
    }).then(() => {
      res.status(200).send()

      if ([accountTypes.PREMIUM.name, accountTypes.GOLD.name].includes(newAccountType) && oldAccountType === accountTypes.LIMITED.name) {
        return new Email(
          [req.user.email],
          'Thanks for upgrading your Edward account!',
          'Hi! I\'m Isaac, the creator of Edward. Thanks for upgrading your account. ' +
          'I hope you enjoy all your new Premium features, like automatic backups, cloud storage, and workshops.' +
          '\n\nWhat do you think of Edward so far? I\'d love to hear your thoughts.' +
          '\n\nAs a Premium user, your concerns and suggestions are very important, so ' +
          'feel free to reach out to me any time at this address.' +
          '\n\nAnd if you\'d prefer to share your thoughts anonymously, you can take our survey at ' +
          'https://goo.gl/forms/LeEHKbXGFkNYUNgL2.' +
          '\n\nGood luck with your novel!'
        )
      }
    }, err => {
      if (res.headersSent) {
        return
      }

      console.error(err)
      res.status(500).send()
    })
  })

  // POST { token }
  app.post(route('update-payment'), isLoggedInMiddleware, isNotDemoMiddleware, (req, res, next) => {
    const { token } = req.body

    if (!token) {
      const err = new Error('Cannot update payment method without a valid token.')
      console.error(err)
      return res.status(500).send()
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      if (!user) {
        throw new Error('Current user was not found.')
      }

      return payments.setSubscription(
        user.email,
        user.stripe_customer_id,
        payments.planIds[user.account_type],
        token,
        db.knex
      )
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { email }
  app.post(route('send-reset-password-link'), captchaMiddleware, (req, res, next) => {
    const email = req.body.email

    let guid
    db.knex('users').where('email', email).first().then(user => {
      if (!user) {
        const errorMessage = `A user with the email address ${email} was not found.`
        res.status(500).send(errorMessage)
        throw new Error(errorMessage)
      }

      if (user.account_type === accountTypes.DEMO.name) {
        const errorMessage = 'Cannot perform this action with a Demo account.'
        res.status(500).send(errorMessage)
        throw new Error(errorMessage)
      }

      guid = uuid()
      return modelUtil.getHash(guid)
    }).then(hash => {
      return db.knex('users').where('email', email).update(ts(db.knex, {
        'pass_reset_key': hash
      }, true))
    }).then(() => {
      return new Email(
        [email],
        'Reset your password',
        `A password reset has been requested for your Edward account with email ${email}.` +
        '\nIf you did not request a password reset, you may delete this email and take no further action.' +
        '\nIf you would like to reset your password, please visit the link below:' +
        `\n\n${process.env.BASE_URL}/auth#/reset/${encodeURIComponent(email)}/${guid}`
      ).send()
    })
    .then(() => {
      res.status(200).send()
    }, err => {
      if (res.headersSent) {
        return
      }
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { email, key }
  app.post(route('authenticate-password-reset'), (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(401).send('Email and reset key must be provided.')
      return
    }

    db.knex('users').where({
      email: email
    }).first().then(user => {
      if (!user || !user['pass_reset_key']) {
        res.status(401).send('Email or password reset key is incorrect.')
        return false
      }

      const realHash = user['pass_reset_key']

      return modelUtil.isCorrectPassword(key, realHash).then(() => user, () => {
        res.status(401).send('Email or password reset key is incorrect.')
        return false
      })
    }).then(user => {
      if (!user) {
        return
      }

      // Correct password
      req.login(user, err => {
        if (err) {
          console.error(err)
          res.status(500).send('Could not log in.')
          return false
        }

        db.knex('users').where('email', email).update(ts(db.knex, {
          'pass_reset_key': null
        }, true)).then(() => {
          res.status(200).send()
        }, err => {
          console.error(err)
          res.status(500).send()
        })
      })
    }).then(undefined, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { password }
  app.post(route('delete-account'), isLoggedInMiddleware, isNotDemoMiddleware, (req, res, next) => {
    const { password } = req.body

    db.knex('users').where('id', req.user.id).first(
      'password', 'stripe_customer_id', 'stripe_subscription_id'
    ).then(({
      password: hash,
      stripe_customer_id: stripeId,
      stripe_subscription_id: subscriptionId
    }) => {
      return modelUtil.isCorrectPassword(password, hash).then(() => {
        // Password is correct
        const userId = req.user.id
        req.logout()
        return db.knex('users').where('id', userId).del().then(() => {
          if (stripeId) {
            return payments.deleteAllCustomerData(stripeId, subscriptionId)
          }
        })
      }, () => {
        res.status(401).send('Incorrect password.')
        throw new Error('Incorrect password.')
      })
    }).then(() => {
      res.status(200).send()
    }, err => {
      if (res.headersSent) {
        return
      }

      console.error(err)
      res.status(500).send()
    })
  })
}
