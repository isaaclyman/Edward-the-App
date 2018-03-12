const difference = require('lodash/difference')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getDocId = utilities.getDocId

const updateTopic = (db, userId, docGuid, topic) => {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return utilities.upsert(db.knex, 'master_topics', {
    where: {
      guid: topic.guid,
      'document_id': docId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: topic.archived,
      guid: topic.guid,
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
        order: JSON.stringify([topic.guid]),
        'document_id': docId(),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(topic.guid)) {
          order.push(topic.guid)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
    })
  })
}

const getTopics = (db, userId, documentGuid) => {
  const docId = () => getDocId(db.knex, userId, documentGuid)
  
  let topicOrder, topics
  return Promise.all([
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

    const missingTopics = difference(topics.map(t => t.guid), topicOrder)
    if (missingTopics.length) {
      const order = topicOrder.concat(missingTopics)
      return db.knex('master_topic_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, { order: JSON.stringify(order) }, true))
    }

    return
  }).then(() => {
    topics.sort((topic1, topic2) => {
      return topicOrder.indexOf(topic1.guid) - topicOrder.indexOf(topic2.guid)
    })
    return topics
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, topicGuids }
  app.post(route('topic/arrange'), isPremiumUser, (req, res, next) => {
    const documentGuid = req.body.documentGuid
    const topicGuids = req.body.topicGuids
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, documentGuid)

    db.knex('master_topic_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order }) => {
      if (!utilities.containSameElements(JSON.parse(order), topicGuids)) {
        throw new Error(`Cannot rearrange topics: an invalid topic array was received.`)
      }

      return db.knex('master_topic_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(topicGuids)
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, topicGuid }
  app.post(route('topic/delete'), isPremiumUser, (req, res, next) => {
    const documentGuid = req.body.documentGuid
    const topicGuid = req.body.topicGuid
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, documentGuid)

    db.knex('chapter_topics').where({
      'user_id': userId
    }).whereIn('master_topic_id', knex => {
      knex.select('id').from('master_topics').where({
        guid: topicGuid,
        'document_id': docId(),
        'user_id': userId
      })
    }).del().then(() => {
      return db.knex('master_topics').where({
        guid: topicGuid,
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
      const indexToRemove = order.indexOf(topicGuid)

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

  // POST { documentGuid, topicGuid, topic: {
  //  archived, guid, title
  // } }
  app.post(route('topic/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentGuid = req.body.documentGuid
    const topic = req.body.topic

    updateTopic(db, userId, documentGuid, topic).then(() => {
      res.status(200).send(`Topic "${topic.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('topics/:documentGuid'), isPremiumUser, (req, res, next) => {
    const documentGuid = req.params.documentGuid
    const userId = req.user.id
    
    getTopics(db, userId, documentGuid).then(topics => {
      res.status(200).send(topics)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { getTopics, registerApis, updateTopic }
