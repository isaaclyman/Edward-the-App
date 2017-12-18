const difference = require('lodash/difference')
const isEqual = require('lodash/isEqual')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')

const updateChapter = (db, userId, documentId, chapter) => {
  let dbChapterId, dbDocId, dbChapterTopics

  // Get the document ID
  return db.knex('documents').where({
    guid: documentId,
    'user_id': userId
  }).first().then(({ id: docId }) => {
    // Get the chapter
    dbDocId = docId
    return db.knex('chapters').where({
      guid: chapter.id,
      'user_id': userId,
      'document_id': dbDocId
    }).first()
  }).then(dbChapter => {
    // Insert or update the chapter
    if (!dbChapter) {
      return db.knex('chapters').insert(ts(db.knex, {
        archived: chapter.archived,
        guid: chapter.id,
        title: chapter.title,
        'user_id': userId,
        'document_id': dbDocId
      })).returning('id')
    }

    const update = {
      archived: chapter.archived,
      title: chapter.title
    }

    // Only update chapter content if it has changed
    if (!isEqual(dbChapter.content, chapter.content)) {
      update.content = chapter.content
    }

    return db.knex('chapters').where({
      guid: chapter.id,
      'user_id': userId,
      'document_id': dbDocId
    }).update(ts(db.knex, update, true)).returning('id')
  }).then(([chapterId]) => {
    dbChapterId = chapterId

    // Get chapter topics
    return db.knex('chapter_topics').where({
      'user_id': userId,
      'chapter_id': dbChapterId
    }).select()
  }).then(chapterTopics => {
    dbChapterTopics = chapterTopics

    // Get master topics
    return db.knex('master_topics').where({
      'user_id': userId,
      'document_id': dbDocId
    }).select()
  }).then(masterTopics => {
    // Update chapter topics
    const topicDict = chapter.topics || {}
    const topicIds = Object.keys(topicDict)

    // Ensure that all submitted chapter topics correspond to a master topic
    const badIds = difference(topicIds, masterTopics.map(mt => mt.guid))
    if (badIds.length) {
      throw new Error(`MasterTopics ${JSON.stringify(badIds)} were not found.`)
    }

    // Determine which chapter topics to insert and which ones to update
    const idsToInsert = difference(topicIds, dbChapterTopics.map(ct => ct.guid))
    const idsToUpdate = difference(topicIds, idsToInsert)

    const insertPromise = db.knex('chapter_topics').insert(idsToInsert.map(id => ts(db.knex, {
      content: topicDict[id].content,
      'user_id': userId,
      'chapter_id': dbChapterId,
      'master_topic_id': masterTopics.find(mt => mt.guid === id).id
    })))

    const updatePromises = idsToUpdate.map(id => db.knex('chapter_topics').where({
      'user_id': userId,
      'chapter_id': dbChapterId,
      'master_topic_id': masterTopics.find(mt => mt.guid === id).id
    }).update(ts(db.knex, {
      content: topicDict[id].content
    })))

    return Promise.all([insertPromise, ...updatePromises])
  }).then(() => {
    return db.knex('chapter_orders').where({
      'owner_guid': documentId,
      'user_id': userId
    }).first()
  }).then(chapterOrder => {
    // Make sure there's a chapter order and the current chapter is included in it
    if (!chapterOrder) {
      return db.knex('chapter_orders').insert(ts(db.knex, {
        'owner_guid': documentId,
        order: JSON.stringify([chapter.id]),
        'user_id': userId
      }))
    }

    const order = JSON.parse(chapterOrder.order || '[]')
    if (!order.includes(chapter.id)) {
      order.push(chapter.id)
      return db.knex('chapter_orders').where({
        'owner_guid': documentId,
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(order)
      }, true))
    }

    return
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, chapterIds }
  app.post(route('chapter/arrange'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const chapterIds = req.body.chapterIds
    const userId = req.user.id

    db.knex('chapter_orders').where({
      'owner_guid': documentId,
      'user_id': userId
    }).first().then(chapterOrder => {
      if (!utilities.containSameElements(JSON.parse(chapterOrder.order), chapterIds)) {
        throw new Error(`Cannot rearrange chapters: an invalid chapter array was received.`)
      }

      return db.knex('chapter_orders').where({
        'owner_guid': documentId,
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(chapterIds)
      }), true)
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { fileId, chapterId }
  app.post(route('chapter/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const chapterId = req.body.chapterId
    const userId = req.user.id

    let dbDocId
    // Get document
    db.knex('documents').where({
      guid: documentId,
      'user_id': userId
    }).first().then(doc => {
      dbDocId = doc.id
      // Get chapter
      return db.knex('chapters').where({
        guid: chapterId,
        'document_id': dbDocId,
        'user_id': userId
      }).first()
    }).then(chapter => {
      // Delete chapter topics
      return db.knex('chapter_topics').where({
        'chapter_id': chapter.id,
        'user_id': userId
      }).del()
    }).then(() => {
      // Delete chapter
      return db.knex('chapters').where({
        guid: chapterId,
        'document_id': dbDocId,
        'user_id': userId
      }).del()
    }).then(() => {
      // Get chapter order
      return db.knex('chapter_orders').where({
        'owner_guid': documentId,
        'user_id': userId
      }).first()
    }).then((chapterOrder = {}) => {
      // Splice chapter from order
      const order = JSON.parse(chapterOrder.order || '[]')
      const indexToRemove = order.indexOf(chapterId)

      if (~indexToRemove) {
        order.splice(indexToRemove, 1)
        return db.knex('chapter_orders').where({
          'owner_guid': documentId,
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

  // POST { fileId, chapterId, chapter: {
  //   archived, content, id, title, topics: {
  //     [id]: chapterTopic {
  //       content, id
  //     }
  //   }
  // } }
  app.post(route('chapter/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentId = req.body.fileId
    const chapter = req.body.chapter

    updateChapter(db, userId, documentId, chapter).then(() => {
      res.status(200).send(`Chapter "${chapter.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('chapters/:documentId'), isPremiumUser, (req, res, next) => {
    const documentId = req.params.documentId
    const userId = req.user.id

    let chapterOrder, chapters
    Promise.all([
      db.knex('chapter_orders').where({
        'owner_guid': documentId,
        'user_id': userId
      }).first().then(({ order = '[]' } = {}) => { return JSON.parse(order) }),
      db.knex('chapters').where('chapters.user_id', userId)
      .innerJoin('documents', 'chapters.document_id', 'documents.id').where('documents.guid', documentId)
      .select({
        archived: 'chapters.archived',
        content: 'chapters.content',
        guid: 'chapters.guid',
        id: 'chapters.id',
        title: 'chapters.title'
      })
    ]).then(([chapOrder, chaps]) => {
      chapterOrder = chapOrder
      chapters = chaps
      const missingChapters = difference(chapters.map(c => c.guid), chapterOrder)

      if (missingChapters.length) {
        const order = chapterOrder.concat(missingChapters)
        return db.knex('chapter_orders').where({
          'owner_guid': documentId,
          'user_id': userId
        }).update(ts(db.knex, { order }, true))
      }

      return
    }).then(() => {
      return (
        db.knex('chapter_topics').where('chapter_topics.user_id', userId).whereIn('chapter_topics.chapter_id', chapters.map(c => c.id))
        .innerJoin('master_topics', 'chapter_topics.master_topic_id', 'master_topics.id').select({
          archived: 'master_topics.archived',
          'chapter_id': 'chapter_topics.chapter_id',
          content: 'chapter_topics.content',
          id: 'master_topics.guid',
          title: 'master_topics.title'
        })
      )
    }).then(chapterTopics => {
      const topicsByChapter = chapterTopics.reduce((dict, topic) => {
        const topics = dict[topic['chapter_id']] || []
        topics.push(topic)
        return dict
      }, {})

      const chaptersWithTopics = chapters.map(chapter => {
        chapter.topics = (topicsByChapter[chapter.id] || []).reduce((dict, topic) => {
          dict[topic.id] = topic
          return dict
        }, {})
        return chapter
      })

      chaptersWithTopics.sort((chapter1, chapter2) => {
        return chapterOrder.indexOf(chapter1.guid) - chapterOrder.indexOf(chapter2.guid)
      })

      res.status(200).send(chaptersWithTopics)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updateChapter }
