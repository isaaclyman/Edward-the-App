module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  app.post(route('chapter/add'), isPremiumUser, (req, res, next) => {

  })
}
