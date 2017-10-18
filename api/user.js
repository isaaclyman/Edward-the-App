const request = require('request-promise-native')

module.exports = function (app, passport) {
  const route = route => `/api/user/${route}`

  const verifyCaptchaToken = (req) => {
    const token = req.body && req.body.captchaResponse
    return new Promise((resolve, reject) => {
      if (!token) {
        reject()
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
    verifyCaptchaToken(req).then(() => {
      return next()
    }, () => {
      res.status(401).send({ success: false, message: 'captcha failed' })
    })
  }

  app.post(route('signup'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send({ success: false, message: 'authentication failure' })
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.send({ success: true, message: 'authentication success' })
      })
    })(req, res, next)
  })

  app.post(route('login'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-login', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send({ success: false, message: 'authentication failure' })
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.send({ success: true, message: 'authentication success' })
      })
    })(req, res, next)
  })
}
