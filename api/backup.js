const { addDocument, deleteDocument, getDocuments, saveAllContent } = require('./document')
const { getChapters } = require('./chapter')
const { getTopics } = require('./topic')
const { getPlans } = require('./plan')
const find = require('lodash/find')

const getDocExport = (db, userId, docGuid) => {  
  return Promise.all([
    getDocuments(db, userId).then(docs => {
      return find(docs, doc => doc.guid === docGuid)
    }),
    getChapters(db, userId, docGuid),
    getTopics(db, userId, docGuid),
    getPlans(db, userId, docGuid)
  ]).then(([doc, chapters, topics, plans]) => {
    if (!doc) {
      throw new Error('Could not find document.')
    }

    doc.chapters = chapters
    doc.topics = topics
    doc.plans = plans
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
        getPlans(db, userId, docGuid)
      ]).then(([doc, chapters, topics, plans]) => {
        doc.chapters = chapters
        doc.topics = topics
        doc.plans = plans
        return doc
      })
    }))
  })
}

const importDoc = (db, userId, doc) => {
  return addDocument(db, userId, doc).then(() => {
    return saveAllContent(db, userId, doc.guid, doc.chapters, doc.topics, doc.plans)
  })
}

const importFull = (db, userId, docs) => {
  const addPromises = docs.map(doc => {
    return addDocument(db, userId, doc).then(() => {
      return saveAllContent(db, userId, doc.guid, doc.chapters, doc.topics, doc.plans)
    }).then(result => ({ result, success: true }), err => ({ err, success: false }))
  })

  return Promise.all(addPromises).then(results => {
    const failures = results.filter(res => !res.success)
    if (failures.length) {
      throw new Error(`Unable to add document. ${failures.map(f => f.err)}`)
    }
  })
}

const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/backup/${route}`

  // POST [{ guid, name, chapters, topics, plans }]
  app.post(route('import'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const newDocs = req.body
    
    let oldDocs
    getFullExport(db, userId).then(docs => {
      oldDocs = docs
    }).then(
      () => Promise.all(oldDocs.map(doc => deleteDocument(db, userId, doc.guid)))
    ).then(
      () => importFull(db, userId, newDocs)
    ).then(() => {
      res.status(200).send()
    }, err => {
      console.error('[BACKUP IMPORT ERROR.]', err)
      const docsToDelete = [...oldDocs, ...newDocs].filter(doc => doc && uuidRx.test(doc.guid))

      Promise.all(
        docsToDelete.map(doc => deleteDocument(db, userId, doc.guid))
      ).then(() => {
        return importFull(db, userId, oldDocs)
      }).then(docs => {
        res.status(500).send(`[IMPORT REVERTED.] ${err}`)
      }, revertErr => {
        console.error('[IMPORT REVERT ERROR.]', revertErr)
        res.status(500).send(`[IMPORT REVERT FAILED.] ${revertErr}`)
      })
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

module.exports = { registerApis }