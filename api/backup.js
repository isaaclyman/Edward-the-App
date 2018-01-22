module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/backup/${route}`

  app.post(route('import'), isPremiumUser, (req, res, next) => {
    const data = req.body
    
  })

  app.get(route('export'), isPremiumUser, (req, res, next) => {
    
  })
}
