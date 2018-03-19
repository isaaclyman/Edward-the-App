const orderPromises = require('../utilities').orderPromises
const updateChapter = require('./chapter').updateChapter
const updateTopic = require('./topic').updateTopic
const updatePlan = require('./plan').updatePlan
const updateSection = require('./section').updateSection
const updateWorkshop = require('./workshops').updateWorkshop
const ts = require('../models/_util').addTimestamps
const utilities = require('./utilities')

const addDocument = (db, userId, document) => {
  return db.knex('documents').where({
    guid: document.guid,
    'user_id': userId
  }).first().then(doc => {
    if (doc) {
      const error = 'Could not create document. A document with this ID already exists for the current user.'
      throw new Error(error)
    }

    return utilities.upsert(db.knex, 'document_orders', {
      where: { 'user_id': userId },
      insert: ts(db.knex, {
        order: JSON.stringify([document.guid]),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        order.push(document.guid)
        return ts(db.knex, { order: JSON.stringify(order) }, true)
      }
    })
  }).then(() => {
    return db.knex('documents').insert(ts(db.knex, {
      guid: document.guid,
      name: document.name,
      'user_id': userId
    }))
  })
}

const deleteDocument = (db, userId, docGuid) => {
  return db.knex('document_orders').where('user_id', userId).first().then(dbDocOrder => {
    const order = JSON.parse(dbDocOrder.order)
    const indexToRemove = order.indexOf(docGuid)

    if (~indexToRemove) {
      order.splice(indexToRemove, 1)
      return db.knex('document_orders').where('user_id', userId).update(ts(db.knex, {
        order: JSON.stringify(order)
      }, true))
    }

    return
  }).then(() => {
    return (
      db.knex('documents').where({
        guid: docGuid,
        'user_id': userId
      }).del()
    )
  })
}

const getDocuments = (db, userId) => {
  return Promise.all([
    db.knex('documents').where('user_id', userId).select().then((dbDocs = []) => dbDocs),
    db.knex('document_orders').where('user_id', userId).first('order').then(
      ({ order = '[]' } = {}) => JSON.parse(order)
    )
  ]).then(([documents, docOrder]) => {
    // If there are any document guids missing from the order, failsafe them in
    const missingDocGuids = documents.map(doc => doc.guid).filter(guid => !docOrder.includes(guid))

    if (missingDocGuids.length) {
      const newDocOrder = JSON.stringify(docOrder.concat(missingDocGuids))
      return db.knex('document_orders').where('user_id', userId).update({
        order: newDocOrder
      }).then(() => [documents, newDocOrder])
    }

    return [documents, docOrder]
  }).then(([documents, docOrder]) => {
    documents.sort((doc1, doc2) => {
      return docOrder.indexOf(doc1.guid) - docOrder.indexOf(doc2.guid)
    })
    return documents
  })
}

const saveAllContent = (db, userId, docGuid, chapters = [], topics = [], plans = [], workshops = []) => {
  const updateTopicFns = topics.map(topic => () => updateTopic(db, userId, docGuid, topic))
  const updateTopicPromise = orderPromises(updateTopicFns)
  const updateChapterPromise = updateTopicPromise.then(() => {
    const updateChapterFns = chapters.map(chapter => () => updateChapter(db, userId, docGuid, chapter))
    return orderPromises(updateChapterFns)
  })

  const updatePlanFns = plans.map(
    plan => () => updatePlan(db, userId, docGuid, plan).then(() => {
      const updateSectionFns = plan.sections.map(section => () => updateSection(db, userId, docGuid, plan.guid, section))
      return orderPromises(updateSectionFns)
    })
  )
  const updatePlanPromise = orderPromises(updatePlanFns)

  const updateWorkshopFns = workshops.map(workshop => () => updateWorkshop(db, userId, docGuid, workshop))
  const updateWorkshopPromise = orderPromises(updateWorkshopFns)

  return Promise.all([updateChapterPromise, updatePlanPromise, updateWorkshopPromise])
}

const registerApis = function (app, passport, db, isPremiumUser, isNotOverdue) {
  const route = route => `/api/${route}`

  // POST { guid, name }
  app.post(route('document/add'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id

    addDocument(db, userId, document).then(() => {
      res.status(200).send(`Document "${document.name}" created.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { guid }
  app.post(route('document/delete'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.guid
    const userId = req.user.id

    deleteDocument(db, userId, docGuid).then(() => {
      res.status(200).send(`Document "${docGuid}" deleted.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { guid, name } UPDATES name
  app.post(route('document/update'), isPremiumUser, (req, res, next) => {
    const document = req.body
    const userId = req.user.id

    db.knex('documents').where({
      guid: document.guid,
      'user_id': userId
    }).update({ name: document.name }).then(() => {
      res.status(200).send(`Document "${document.name}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('documents'), isPremiumUser, isNotOverdue, (req, res, next) => {
    const userId = req.user.id

    getDocuments(db, userId).then(documents => {
      res.status(200).send(documents)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // SAVE ALL CONTENT
  // POST { documentGuid, chapters, plans, topics, workshops }
  app.post(route('document/saveAll'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { documentGuid: docGuid, chapters, topics, plans, workshops } = req.body

    saveAllContent(db, userId, docGuid, chapters, topics, plans, workshops).then(() => {
      res.status(200).send({ docGuid, chapters, plans, topics })
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { addDocument, deleteDocument, getDocuments, saveAllContent, registerApis }
