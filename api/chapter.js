const difference = require('lodash/difference')
const isEqual = require('lodash/isEqual')
const ts = require('../models/_util').addTimestamps
const utilities = require('./api_util')
const getDocId = utilities.getDocId
const getChapId = utilities.getChapId

const updateChapter = (db, userId, docGuid, chapter) => {
  const docId = () => getDocId(db.knex, userId, docGuid)
  const chapId = () => getChapId(db.knex, userId, docGuid, chapter.guid)

  // Upsert the chapter
  return utilities.upsert(db.knex, 'chapters', {
    where: {
      guid: chapter.guid,
      'document_id': docId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: chapter.archived,
      content: chapter.content,
      guid: chapter.guid,
      title: chapter.title,
      'user_id': userId,
      'document_id': docId()
    }),
    getUpdate: dbChap => {
      const update = {
        archived: chapter.archived,
        // Only update content if it has changed
        content: !isEqual(dbChap.content, chapter.content) ? chapter.content : undefined,
        title: chapter.title
      }

      return ts(db.knex, update, true)
    }
  }).then(chapterId => {
    // Get master topics and chapter topics
    return Promise.all([
      db.knex('chapter_topics').where({
        'user_id': userId,
        'chapter_id': chapterId
      }).select(),
      db.knex('master_topics').where({
        'user_id': userId,
        'document_id': docId()
      }).select()
    ])
  }).then(([chapterTopics, masterTopics]) => {
    // Update chapter topics
    const topicDict = chapter.topics || {}
    const incomingTopicGuids = Object.keys(topicDict)

    // Ensure that all submitted chapter topics correspond to a master topic
    const badGuids = difference(incomingTopicGuids, masterTopics.map(mt => mt.guid))
    if (badGuids.length) {
      throw new Error(`MasterTopics ${JSON.stringify(badGuids)} were not found.`)
    }

    // Determine which chapter topics to insert and which ones to update
    const existingTopicGuids = chapterTopics.map(ct => {
      return masterTopics.find(mt => mt.id === ct.master_topic_id).guid
    })

    const guidsToInsert = difference(incomingTopicGuids, existingTopicGuids)
    const guidsToUpdate = difference(incomingTopicGuids, guidsToInsert)

    const insertPromise = db.knex('chapter_topics').insert(guidsToInsert.map(guid => ts(db.knex, {
      content: topicDict[guid].content,
      'user_id': userId,
      'chapter_id': chapId(),
      'master_topic_id': masterTopics.find(mt => mt.guid === guid).id
    })))

    const updatePromises = guidsToUpdate.map(guid => db.knex('chapter_topics').where({
      'user_id': userId,
      'chapter_id': chapId(),
      'master_topic_id': masterTopics.find(mt => mt.guid === guid).id
    }).update(ts(db.knex, {
      content: topicDict[guid].content
    })))

    return Promise.all([insertPromise, ...updatePromises])
  }).then(() => {
    // Make sure a chapter order exists and the current chapter is included
    return utilities.upsert(db.knex, 'chapter_orders', {
      where: {
        'document_id': docId(),
        'user_id': userId
      },
      insert: ts(db.knex, {
        'document_id': docId(),
        order: JSON.stringify([chapter.guid]),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(chapter.guid)) {
          order.push(chapter.guid)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
    })
  })
}

const getChapters = (db, userId, docGuid) => {
  const docId = () => getDocId(db.knex, userId, docGuid)

  let chapterOrder, chapters
  return Promise.all([
    db.knex('chapter_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order = '[]' } = {}) => { return JSON.parse(order) }),
    db.knex('chapters').where({
      'document_id': docId(),
      'user_id': userId
    }).select()
  ]).then(([_chapterOrder, _chapters]) => {
    chapterOrder = _chapterOrder
    chapters = _chapters
    const missingChapters = difference(chapters.map(c => c.guid), chapterOrder)

    if (missingChapters.length) {
      const order = chapterOrder.concat(missingChapters)
      return db.knex('chapter_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, { order: JSON.stringify(order) }, true))
    }

    return
  }).then(() => {
    return (
      db.knex('chapter_topics').where('chapter_topics.user_id', userId).whereIn('chapter_topics.chapter_id', chapters.map(c => c.id))
      .innerJoin('master_topics', 'chapter_topics.master_topic_id', 'master_topics.id').select({
        archived: 'master_topics.archived',
        chapterId: 'chapter_topics.chapter_id',
        content: 'chapter_topics.content',
        guid: 'master_topics.guid',
        title: 'master_topics.title'
      })
    )
  }).then(chapterTopics => {
    const topicsByChapter = chapterTopics.reduce((dict, topic) => {
      const topics = dict[topic.chapterId] || []
      topics.push(topic)
      dict[topic.chapterId] = topics
      return dict
    }, {})

    const chaptersWithTopics = chapters.map(chapter => {
      chapter.topics = (topicsByChapter[chapter.id] || []).reduce((dict, topic) => {
        dict[topic.guid] = topic
        return dict
      }, {})
      return chapter
    })

    chaptersWithTopics.sort((chapter1, chapter2) => {
      return chapterOrder.indexOf(chapter1.guid) - chapterOrder.indexOf(chapter2.guid)
    })

    return chaptersWithTopics
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, chapterGuids }
  app.post(route('chapter/arrange'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const chapterGuids = req.body.chapterGuids
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, docGuid)

    db.knex('chapter_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order }) => {
      if (!utilities.containSameElements(JSON.parse(order), chapterGuids)) {
        throw new Error(`Cannot rearrange chapters: an invalid chapter array was received.`)
      }

      return db.knex('chapter_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(chapterGuids)
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, chapterGuid }
  app.post(route('chapter/delete'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const chapterGuid = req.body.chapterGuid
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, docGuid)

    // Delete chapter topics
    return db.knex('chapter_topics').where({
      'user_id': userId
    }).whereIn('chapter_id', knex => {
      knex.select('id').from('chapters').where({
        guid: chapterGuid,
        'document_id': docId(),
        'user_id': userId
      })
    }).del().then(() => {
      // Delete chapter
      return db.knex('chapters').where({
        guid: chapterGuid,
        'document_id': docId(),
        'user_id': userId
      }).del()
    }).then(() => {
      // Get chapter order
      return db.knex('chapter_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).first('order')
    }).then(({ order: chapterOrder }) => {
      // Splice chapter from order
      const order = JSON.parse(chapterOrder || '[]')
      const indexToRemove = order.indexOf(chapterGuid)

      if (~indexToRemove) {
        order.splice(indexToRemove, 1)
        return db.knex('chapter_orders').where({
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

  // POST { documentGuid, chapterGuid, chapter: {
  //   archived, content, guid, title, topics: {
  //     [guid]: chapterTopic {
  //       content, guid
  //     }
  //   }
  // } }
  app.post(route('chapter/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const docGuid = req.body.documentGuid
    const chapter = req.body.chapter

    updateChapter(db, userId, docGuid, chapter).then(() => {
      res.status(200).send(`Chapter "${chapter.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('chapters/:documentGuid'), isPremiumUser, (req, res, next) => {
    const docGuid = req.params.documentGuid
    const userId = req.user.id
    getChapters(db, userId, docGuid).then(chapters => {
      res.status(200).send(chapters)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { getChapters, registerApis, updateChapter }
