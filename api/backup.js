const { addDocument, deleteDocument, getDocuments, saveAllContent } = require('./document')
const { getChapters } = require('./chapter')
const { getTopics } = require('./topic')
const { getPlans } = require('./plan')
const { getWorkshops } = require('./workshops')
const orderPromises = require('../compiled/utilities').orderPromises
const find = require('lodash/find')

const getDocExport = (db, userId, docGuid) => {  
  return Promise.all([
    getDocuments(db, userId).then(docs => {
      return find(docs, doc => doc.guid === docGuid)
    }),
    getChapters(db, userId, docGuid),
    getTopics(db, userId, docGuid),
    getPlans(db, userId, docGuid),
    getWorkshops(db, userId, docGuid)
  ]).then(([doc, chapters, topics, plans, workshops]) => {
    if (!doc) {
      throw new Error('Could not find document.')
    }

    doc.chapters = chapters
    doc.topics = topics
    doc.plans = plans
    doc.workshops = workshops
    return doc
  })
}

const getFullExport = (db, userId) => {
  return getDocuments(db, userId).then(docs => {
    return Promise.all(docs.map(doc => {
      const docGuid = doc.guid
      return Promise.all([
        Promise.resolve(doc),
        getChapters(db, userId, docGuid),
        getTopics(db, userId, docGuid),
        getPlans(db, userId, docGuid),
        getWorkshops(db, userId, docGuid)
      ]).then(([doc, chapters, topics, plans, workshops]) => {
        doc.chapters = chapters
        doc.topics = topics
        doc.plans = plans
        doc.workshops = workshops
        return doc
      })
    }))
  })
}

const importDoc = (db, userId, doc) => {
  return addDocument(db, userId, doc).then(() => {
    return saveAllContent(db, userId, doc.guid, doc.chapters, doc.topics, doc.plans, doc.workshops)
  })
}

const importFull = (db, userId, docs) => {
  const addFns = docs.map(doc => () => {
    return addDocument(db, userId, doc).then(() => {
      return saveAllContent(db, userId, doc.guid, doc.chapters, doc.topics, doc.plans, doc.workshops)
    })
  })

  return orderPromises(addFns).then(() => { }, err => {
    console.error(err)
    throw new Error(`Unable to add document. ${err}`)
  })
}

const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const importFullWithSafeDelete = (db, userId, newDocs) => {
  let oldDocs
  return getFullExport(db, userId).then(docs => {
    oldDocs = docs
  }).then(
    () => Promise.all(oldDocs.map(doc => deleteDocument(db, userId, doc.guid)))
  ).then(
    () => importFull(db, userId, newDocs)
  ).then(() => {
    return true
  }, err => {
    console.error('[BACKUP IMPORT ERROR.]', err)
    const docsToDelete = [...oldDocs, ...newDocs].filter(doc => doc && uuidRx.test(doc.guid))

    return Promise.all(
      docsToDelete.map(doc => deleteDocument(db, userId, doc.guid))
    ).then(() => {
      return importFull(db, userId, oldDocs)
    }).then(docs => {
      throw new Error(`[IMPORT REVERTED.] ${err}`)
    }, revertErr => {
      console.error('[IMPORT REVERT ERROR.]', revertErr)
      throw new Error(`[IMPORT REVERT FAILED.] ${revertErr}`)
    })
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/backup/${route}`

  // POST [{ guid, name, chapters, topics, plans }]
  app.post(route('import'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const newDocs = req.body
    
    importFullWithSafeDelete(db, userId, newDocs).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err.toString())
    })
  })

  // POST { guid, name, chapters, topics, plans }
  app.post(route('import/document'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const newDoc = req.body
    
    let oldDoc
    getDocExport(db, userId, newDoc.guid).then(doc => {
      oldDoc = doc
    }, () => {
      // No old document was found, probably
    }).then(() =>
      deleteDocument(db, userId, newDoc.guid)
    ).then(() =>
      importDoc(db, userId, newDoc)
    ).then(() => {
      res.status(200).send()
    }, err => {
      console.error('[DOCUMENT IMPORT ERROR.]', err)

      if (!oldDoc) {
        res.status(500).send(`[NO DOCUMENT TO REVERT TO.] ${err}`)
        return
      }

      deleteDocument(db, userId, newDoc.guid).then(() =>
        importDoc(db, userId, oldDoc)
      ).then(() => {
        res.status(500).send(`[DOCUMENT IMPORT REVERTED.] ${err}`)
      }, revertErr => {
        console.error('[DOCUMENT IMPORT REVERT ERROR.]', revertErr)
        res.status(500).send(`[DOCUMENT IMPORT REVERT FAILED.] ${revertErr}`)
      })
    })
  })

  // GET
  app.get(route('export'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    getFullExport(db, userId).then(docs => {
      res.status(200).send(docs)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('export/document/:documentGuid'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentGuid = req.params.documentGuid

    getDocExport(db, userId, documentGuid).then(doc => {
      res.status(200).send(doc)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, getFullExport, importFull, importFullWithSafeDelete }