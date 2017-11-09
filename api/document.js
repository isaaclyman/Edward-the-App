module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { id, name }
  app.post(route('document/add'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id
    db.DocOrder.findOne({
      where: {
        id: document.guid,
        userId
      }
    }).then(doc => {
      if (doc) {
        res.status(409).send('Could not create document. A document with this ID already exists for the current user.')
        return
      }

      return db.DocOrder.findCreateFind({
        where: {
          userId
        },
        defaults: {
          order: [],
          userId
        }
      })
    }).then(([docOrder]) => {
      docOrder.order.push(document.id)
      return docOrder.update({
        order: docOrder.order
      })
    }).then(() => {
      const newDoc = new db.Doc()
      newDoc.guid = document.id
      newDoc.name = document.name
      newDoc.userId = req.user.id

      return newDoc.save()
    }).then(() => {
      res.status(200).send(`Document "${document.name}" created.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { id }
  app.post(route('document/delete'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id

    db.DocOrder.findOne({
      where: {
        userId
      }
    }).then(docOrder => {
      const indexToRemove = docOrder.order.indexOf(document.id)

      if (~indexToRemove) {
        docOrder.order.splice(indexToRemove, 1)
        return docOrder.save()
      }

      return indexToRemove
    }).then(() => {
      return db.Doc.destroy({
        where: {
          guid: document.id,
          userId
        }
      })
    }).then(() => {
      res.status(200).send(`Document "${document.id}" deleted.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { id, name } UPDATES name
  app.post(route('document/update'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id

    db.Doc.findOne({
      where: {
        guid: document.id,
        userId
      }
    }).then(dbDoc => {
      dbDoc.name = document.name
      return dbDoc.save()
    }).then(() => {
      res.status(200).send(`Document "${document.name}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // GET
  app.get(route('documents'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    let docOrder, documents

    db.DocOrder.findOne({
      where: {
        userId
      }
    }).then(dbDocOrder => {
      docOrder = dbDocOrder
      return db.Doc.findAll({
        where: {
          userId
        }
      })
    }).then(dbDocuments => {
      documents = dbDocuments

      let orderOutOfDate = false
      documents.forEach(doc => {
        if (!~docOrder.order.indexOf(doc.guid)) {
          orderOutOfDate = true
          docOrder.order.push(doc.guid)
        }
      })

      if (orderOutOfDate) {
        return docOrder.save()
      }

      return orderOutOfDate
    }).then(() => {
      documents.sort((doc1, doc2) => {
        return docOrder.order.indexOf(doc1.guid) - docOrder.order.indexOf(doc2.guid)
      })

      res.status(200).send(documents)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}
