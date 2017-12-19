const difference = require('lodash/difference')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getDocId = utilities.getDocId
const getMasterTopicId = utilities.getMasterTopicId

const updateTopic = (db, userId, documentId, topic) => {
  const docId = () => getDocId(db.knex, userId, documentId)

  return utilities.upsert(db.knex, 'master_topics', {
    where: {
      guid: topic.id,
      'document_id': docId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: topic.archived,
      guid: topic.id,
      title: topic.title,
      'document_id': docId(),
      'user_id': userId
    }),
    update: ts(db.knex, {
      archived: topic.archived,
      title: topic.title
    }, true)
  }).then(() => {
    return utilities.upsert(db.knex, 'master_topic_orders', {
      where: {
        'document_id': docId(),
        'user_id': userId
      },
      insert: ts(db.knex, {
        order: JSON.stringify([topic.id]),
        'document_id': docId(),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(topic.id)) {
          order.push(topic.id)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
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

    const docId = () => getDocId(db.knex, userId, documentId)

    db.knex('master_topic_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order }) => {
      if (!utilities.containSameElements(JSON.parse(order), topicIds)) {
        throw new Error(`Cannot rearrange topics: an invalid topic array was received.`)
      }

      return db.knex('master_topic_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(topicIds)
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { fileId, topicId }
  app.post(route('topic/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const topicId = req.body.topicId
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, documentId)
    const masterTopicId = () => getMasterTopicId(db.knex, userId, documentId, topicId)

    db.knex('chapter_topics').where({
      'master_topic_id': masterTopicId(),
      'user_id': userId
    }).del().then(() => {
      return db.knex('master_topics').where({
        guid: topicId,
        'document_id': docId(),
        'user_id': userId
      }).del()
    }).then(() => {
      return db.knex('master_topic_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).first('order')
    }).then(({ order: topicOrder }) => {
      // Splice topic from order
      const order = JSON.parse(topicOrder || '[]')
      const indexToRemove = order.indexOf(topicId)

      if (~indexToRemove) {
        order.splice(indexToRemove, 1)
        return db.knex('master_topic_orders').where({
          'document_id': docId(),
          'user_id': userId
        }).update(ts(db.knex, { order: JSON.stringify(order) }, true))
      }

      return
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

    const docId = () => getDocId(db.knex, userId, documentId)

    Promise.all([
      db.knex('master_topic_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).first('order').then(({ order = '[]' } = {}) => { return JSON.parse(order) }),
      db.knex('master_topics').where({
        'document_id': docId(),
        'user_id': userId
      }).select()
    ]).then(([_topicOrder, _topics]) => {
      topicOrder = _topicOrder
      topics = _topics

      const missingTopics = difference(topics.map(c => c.guid), topicOrder)
      if (missingTopics.length) {
        const order = topicOrder.concat(missingTopics)
        return db.knex('master_topic_orders').where({
          'document_id': docId(),
          'user_id': userId
        }).update(ts(db.knex, { order }, true))
      }

      return
    }).then(() => {
      topics.sort((topic1, topic2) => {
        return topicOrder.indexOf(topic1.guid) - topicOrder.indexOf(topic2.guid)
      })

      res.status(200).send(topics)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updateTopic }
