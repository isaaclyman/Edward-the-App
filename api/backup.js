import { addDocument, deleteDocument, getDocuments, saveAllContent } from './document'
import { getChapters } from './chapter'
import { getTopics } from './topic'
import { getPlans } from './plan'

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
  return Promise.all(
    docs.map(doc => {
      addDocument(db, userId, doc).then(
        () => saveAllContent(db, userId, doc.id, doc.chapters, doc.topics, doc.plans)
      )
    })
  )
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/backup/${route}`

  // POST { id, guid, name, chapters, topics, plans }
  app.post(route('import'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const newDocs = req.body
    
    let oldDocs
    getFullExport(db, userId).then(docs => {
      oldDocs = docs
    }).then(
      () => importFull(db, userId, newDocs)
    ).then(
      () => Promise.all(oldDocs.map(doc => deleteDocument(db, userId, doc.guid)))
    ).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      Promise.all(newDocs.map(doc => deleteDocument(db, userId, doc.id))).then(() => {
        return importFull(db, userId, oldDocs)
      }).then(() => {
        res.status(500).send(`IMPORT REVERTED. ${err}`)
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