const { addDocument, deleteDocument, getDocuments, saveAllContent } = require('./document')
const { getChapters } = require('./chapter')
const { getTopics } = require('./topic')
const { getPlans } = require('./plan')

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

const importFull = (db, userId, docs) => {
  const addPromises = docs.map(doc => {
    doc.id = doc.guid
    return addDocument(db, userId, doc).then(() => {
      [
        ...doc.chapters,
        ...doc.topics,
        ...doc.plans,
      ]
      .concat(...doc.plans.map(plan => plan.sections))
      .forEach(item => {
        item.id = item.guid
      })
      return saveAllContent(db, userId, doc.guid, doc.chapters, doc.topics, doc.plans)
    }).then(result => ({ result, success: true }), err => ({ err, success: false }))
  })

  return Promise.all(addPromises).then(results => {
    const failures = results.filter(res => !res.success)
    if (failures.length) {
      throw new Error(`Unable to add document. ${JSON.stringify(failures.map(f => f.err))}`)
    }
  })
}

const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/backup/${route}`

  // POST [{ id, guid, name, chapters, topics, plans }]
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
}

module.exports = { registerApis }