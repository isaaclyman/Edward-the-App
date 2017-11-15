const utilities = require('../api/utilities')

const updateTopic = (db, userId, documentId, topic) => {
  return db.Doc.findOne({
    where: {
      guid: documentId,
      userId
    }
  }).then(dbDoc => {
    return db.MasterTopic.findCreateFind({
      where: {
        documentId: dbDoc.id,
        guid: topic.id,
        userId
      },
      defaults: {
        archived: false,
        documentId: dbDoc.id,
        guid: topic.id,
        title: '',
        userId
      }
    })
  }).then(([dbMasterTopic]) => {
    const update = {
      archived: topic.archived,
      title: topic.title
    }

    return dbMasterTopic.update(update)
  }).then(() => {
    return db.MasterTopicOrder.findCreateFind({
      where: {
        ownerGuid: documentId,
        userId
      },
      defaults: {
        order: [],
        ownerGuid: documentId,
        userId
      }
    })
  }).then(([dbMasterTopicOrder]) => {
    if (dbMasterTopicOrder.order.includes(topic.id)) {
      return topic.id
    }

    dbMasterTopicOrder.order.push(topic.id)
    return dbMasterTopicOrder.update({
      order: dbMasterTopicOrder.order
    })
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, topicIds }
  app.post(route('topic/arrange'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const topicIds = req.body.topicIds
    const userId = req.user.id

    db.MasterTopicOrder.findOne({
      where: {
        ownerGuid: documentId,
        userId
      }
    }).then(dbMasterTopicOrder => {
      if (!utilities.containSameElements(dbMasterTopicOrder.order, topicIds)) {
        const err = new Error(`Cannot rearrange topics: an invalid topic array was received.`)
        res.status(400).send(err)
        throw err
      }

      return dbMasterTopicOrder.update({
        order: topicIds
      })
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)

      if (res.headersSent) {
        return
      }

      res.status(500).send(err)
    })
  })

  // POST { fileId, topicId }
  app.post(route('topic/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const topicId = req.body.topicId
    const userId = req.user.id
    let dbDocId

    db.Doc.findOne({
      where: {
        guid: documentId,
        userId
      }
    }).then(dbDoc => {
      dbDocId = dbDoc.id
      return db.MasterTopic.findOne({
        where: {
          documentId: dbDocId,
          guid: topicId,
          userId
        }
      })
    }).then(dbMasterTopic => {
      return db.ChapterTopic.destroy({
        where: {
          masterTopicId: dbMasterTopic.id,
          userId
        }
      })
    }).then(() => {
      return db.MasterTopic.destroy({
        where: {
          documentId: dbDocId,
          guid: topicId,
          userId
        }
      })
    }).then(() => {
      return db.MasterTopicOrder.findOne({
        where: {
          ownerGuid: documentId,
          userId
        }
      })
    }).then(dbMasterTopicOrder => {
      const indexToRemove = dbMasterTopicOrder.order.indexOf(topicId)

      if (~indexToRemove) {
        dbMasterTopicOrder.order.splice(indexToRemove, 1)
        return dbMasterTopicOrder.update({
          order: dbMasterTopicOrder.order
        })
      }

      return indexToRemove
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { fileId, topicId, topic: {
  //  archived, id, title
  // } }
  app.post(route('topic/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentId = req.body.fileId
    const topic = req.body.topic

    updateTopic(db, userId, documentId, topic).then(() => {
      res.status(200).send(`Topic "${topic.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('topics/:documentId'), isPremiumUser, (req, res, next) => {
    const documentId = req.params.documentId
    const userId = req.user.id
    let topicOrder, topics

    db.MasterTopicOrder.findCreateFind({
      where: {
        ownerGuid: documentId,
        userId
      },
      defaults: {
        order: [],
        ownerGuid: documentId,
        userId
      }
    }).then(([dbMasterTopicOrder]) => {
      topicOrder = dbMasterTopicOrder
      return db.MasterTopic.findAll({
        where: {
          userId
        },
        include: [{
          model: db.Doc,
          where: {
            guid: documentId
          }
        }]
      })
    }).then(dbTopics => {
      topics = dbTopics

      let orderOutOfDate = false
      topics.forEach(topic => {
        if (!topicOrder.order.includes(topic.guid)) {
          orderOutOfDate = true
          topicOrder.order.push(topic.guid)
        }
      })

      if (orderOutOfDate) {
        return topicOrder.update({
          order: topicOrder.order
        })
      }

      return orderOutOfDate
    }).then(() => {
      topics.sort((topic1, topic2) => {
        return topicOrder.order.indexOf(topic1.guid) - topicOrder.order.indexOf(topic2.guid)
      })

      res.status(200).send(topics)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updateTopic }
