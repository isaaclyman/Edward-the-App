function isPremiumUser (req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).send('Attempted a storage API call without authentication.')
  }

  console.log(req.user)
  res.status(503).send()
}

module.exports = function (app, passport, db) {
  const route = route => `/api/storage/${route}`

  app.post(route('document/add'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id
    db.Doc.findOne({
      where: {
        guid: document.guid,
        userId
      }
    }).then(doc => {
      if (doc) {
        return res.status(409).send('Could not create document. A document with this ID already exists for the current user.')
      }

      db.Order.findCreateFind({
        where: {
          ownerType: 'document',
          userId
        },
        defaults: {
          ownerGuid: null,
          ownerType: 'document',
          order: []
        }
      }).then(([order]) => {
        const savePromises = []

        order.order.push(document.guid)
        savePromises.push(order.save())

        const newDoc = new db.Doc()
        newDoc.guid = document.guid
        newDoc.name = document.name
        newDoc.userId = req.user.id

        savePromises.push(newDoc.save())

        Promise.all(savePromises).then(() => {
          return res.status(200).send(`Document ${document.name} created.`)
        }, err => {
          console.log(err)
          return res.status(500).send(err)
        })
      }, err => {
        console.log(err)
        res.status(500).send(err)
      })
    }, err => {
      console.log(err)
      res.status(500).send(err)
    })
  })

  app.post(route('document/delete'), isPremiumUser, (req, res, next) => {})
}
