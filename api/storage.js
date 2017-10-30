function isPremiumUser (req) {
  console.log(req.user)
}

module.exports = function (app, passport, db) {
  const route = route => `/api/storage/${route}`

  app.post(route('document/add'), (req, res, next) => {
    const document = req.body
    db.Doc.findOne({
      where: {
        guid: document.guid
      }
    })
  })
}
