module.exports = function (app, passport) {
  const route = route => `/api/user/${route}`

  app.post(route('signup'), (req, res, next) => {
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

  app.post(route('login'), (req, res, next) => {
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
