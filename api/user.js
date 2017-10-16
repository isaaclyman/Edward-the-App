module.exports = function (app, passport) {
  const route = route => `/api/user/${route}`

  // TODO: Notify user that signup failed
  // "Signup failed. Email is not available."
  app.post(route('signup'), (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.send(401, { success: false, message: 'authentication failure' })
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.send({ success: true, message: 'authentication success' })
      })
    })
  })
}
