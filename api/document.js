const updateChapter = require('./chapter').updateChapter
const updateTopic = require('./topic').updateTopic
const updatePlan = require('./plan').updatePlan
const updateSection = require('./section').updateSection

module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { id, name }
  app.post(route('document/add'), isPremiumUser, (req, res, next) => {
    // const document = req.body
    // const userId = req.user.id
    // db.Doc.findOne({
    //   where: {
    //     guid: document.id,
    //     userId
    //   }
    // }).then(doc => {
    //   if (doc) {
    //     res.status(409).send('Could not create document. A document with this ID already exists for the current user.')
    //     return
    //   }

    //   return db.DocOrder.findCreateFind({
    //     where: {
    //       userId
    //     },
    //     defaults: {
    //       order: [],
    //       userId
    //     }
    //   })
    // }).then(([docOrder]) => {
    //   docOrder.order.push(document.id)
    //   return docOrder.update({
    //     order: docOrder.order
    //   })
    // }).then(() => {
    //   const newDoc = new db.Doc()
    //   newDoc.guid = document.id
    //   newDoc.name = document.name
    //   newDoc.userId = req.user.id

    //   return newDoc.save()
    // }).then(() => {
    //   res.status(200).send(`Document "${document.name}" created.`)
    // }, err => {
    //   console.error(err)
    //   res.status(500).send(err)
    // })
  })

  // POST { id }
  app.post(route('document/delete'), isPremiumUser, (req, res, next) => {
    // const document = req.body
    // const userId = req.user.id

    // db.DocOrder.findOne({
    //   where: {
    //     userId
    //   }
    // }).then(docOrder => {
    //   const indexToRemove = docOrder.order.indexOf(document.id)

    //   if (~indexToRemove) {
    //     docOrder.order.splice(indexToRemove, 1)
    //     return docOrder.update({
    //       order: docOrder.order
    //     })
    //   }

    //   return indexToRemove
    // }).then(() => {
    //   return db.Doc.destroy({
    //     where: {
    //       guid: document.id,
    //       userId
    //     }
    //   })
    // }).then(() => {
    //   res.status(200).send(`Document "${document.id}" deleted.`)
    // }, err => {
    //   console.error(err)
    //   res.status(500).send(err)
    // })
  })

  // POST { id, name } UPDATES name
  app.post(route('document/update'), isPremiumUser, (req, res, next) => {
    // const document = req.body
    // const userId = req.user.id

    // db.Doc.findOne({
    //   where: {
    //     guid: document.id,
    //     userId
    //   }
    // }).then(dbDoc => {
    //   return dbDoc.update({
    //     name: document.name
    //   })
    // }).then(() => {
    //   res.status(200).send(`Document "${document.name}" updated.`)
    // }, err => {
    //   console.error(err)
    //   res.status(500).send()
    // })
  })

  // GET
  app.get(route('documents'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id

    let documents, docOrder
    db.knex('documents').where('user_id', userId).select().then((dbDocs = []) => {
      documents = dbDocs
      return db.knex('document_orders').where('user_id', userId).first()
    }).then((dbDocOrder = '[]') => {
      // If there are any document IDs missing from the order, failsafe them in
      docOrder = JSON.parse(dbDocOrder)
      const missingDocIds = documents.map(doc => doc.guid).filter(guid => !docOrder.includes(guid))

      if (missingDocIds.length) {
        const newDocOrder = JSON.stringify(docOrder.concat(missingDocIds))
        return db.knex('document_orders').where('user_id', userId).update({
          order: newDocOrder
        })
      }

      return
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

  // SAVE ALL CONTENT
  // POST { fileId, chapters, plans, topics }
  app.post(route('document/saveAll'), isPremiumUser, (req, res, next) => {
  //   const userId = req.user.id
  //   const { fileId: documentId, chapters, plans, topics } = req.body

  //   const updateTopicFns = topics.map(topic => () => updateTopic(db, userId, documentId, topic))
  //   const updateTopicPromise = orderPromises(updateTopicFns)
  //   const updateChapterPromise = updateTopicPromise.then(() => {
  //     const updateChapterFns = chapters.map(chapter => () => updateChapter(db, userId, documentId, chapter))
  //     return orderPromises(updateChapterFns)
  //   })

  //   const updatePlanFns = plans.map(
  //     plan => () => updatePlan(db, userId, documentId, plan).then(() => {
  //       const updateSectionFns = plan.sections.map(section => () => updateSection(db, userId, documentId, plan.id, section))
  //       return orderPromises(updateSectionFns)
  //     })
  //   )
  //   const updatePlanPromise = orderPromises(updatePlanFns)

  //   Promise.all([updateChapterPromise, updatePlanPromise]).then(() => {
  //     res.status(200).send({ documentId, chapters, plans, topics })
  //   }, err => {
  //     console.error(err)
  //     res.status(500).send(err)
  //   })
  })
}

function orderPromises (promiseFns) {
  // if (!promiseFns[0]) {
  //   return Promise.resolve()
  // }

  // return promiseFns[0]().then(() => {
  //   if (promiseFns.length > 1) {
  //     promiseFns.splice(0, 1)
  //     return orderPromises(promiseFns)
  //   } else {
  //     return promiseFns[0]()
  //   }
  // })
}
