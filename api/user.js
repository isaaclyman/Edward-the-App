const request = require('request-promise-native')

module.exports = function (app, passport, db, isPremiumUser, isLoggedIn) {
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
    if (req.body.email.endsWith('__TEST') && req.body.integration === true) {
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
      db.User.findOne({
        where: { id: user.id },
        include: [db.AccountType]
      }).then(user => {
        const accountType = user['account_type']
        const response = {
          accountType: db.accountTypes[accountType.name],
          email: user.email,
          isPremium: isPremiumUser(accountType)
        }
        resolve(response)
      }, () => {
        reject()
      })
    })
  }

  app.get(route('current'), isLoggedIn, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
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

        return res.status(200).send()
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

  app.get(route('logout'), (req, res, next) => {
    req.logout()
    res.status(200).send()
  })
}
