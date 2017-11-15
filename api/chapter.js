const isEqual = require('lodash/isEqual')
const utilities = require('../api/utilities')

const updateChapter = (db, userId, documentId, chapter) => {
  let dbChapterId

  return db.Doc.findOne({
    where: {
      guid: documentId,
      userId
    }
  }).then(dbDoc => {
    return db.Chapter.findCreateFind({
      where: {
        documentId: dbDoc.id,
        guid: chapter.id,
        userId
      },
      defaults: {
        archived: false,
        documentId: dbDoc.id,
        guid: chapter.id,
        title: '',
        userId
      }
    })
  }).then(([dbChapter]) => {
    dbChapterId = dbChapter.id
    const update = {
      archived: chapter.archived,
      title: chapter.title
    }

    if (!isEqual(dbChapter.content, chapter.content)) {
      update.content = chapter.content
    }

    return dbChapter.update(update)
  }).then(() => {
    return db.ChapterOrder.findCreateFind({
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
  }).then(([dbChapterOrder]) => {
    if (dbChapterOrder.order.includes(chapter.id)) {
      return chapter.id
    }

    dbChapterOrder.order.push(chapter.id)
    return dbChapterOrder.update({
      order: dbChapterOrder.order
    })
  }).then(() => {
    const topics = chapter.topics || {}
    const topicPromises = Object.keys(topics).map(id => {
      const topic = topics[id]
      return db.MasterTopic.findOne({
        where: {
          guid: topic.id,
          userId
        }
      }).then(dbMasterTopic => {
        if (!dbMasterTopic) {
          const error = new Error(`MasterTopic "${topic.id}" was not found.`)
          throw error
        }

        return db.ChapterTopic.findCreateFind({
          where: {
            chapterId: dbChapterId,
            masterTopicId: dbMasterTopic.id,
            userId
          },
          defaults: {
            chapterId: dbChapterId,
            masterTopicId: dbMasterTopic.id,
            userId
          }
        })
      }).then(([dbChapterTopic]) => {
        if (isEqual(dbChapterTopic.content, topic.content)) {
          return
        }

        return dbChapterTopic.update({
          content: topic.content
        })
      })
    })

    return Promise.all(topicPromises)
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, chapterIds }
  app.post(route('chapter/arrange'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const chapterIds = req.body.chapterIds
    const userId = req.user.id

    db.ChapterOrder.findOne({
      where: {
        ownerGuid: documentId,
        userId
      }
    }).then(dbChapterOrder => {
      if (!utilities.containSameElements(dbChapterOrder.order, chapterIds)) {
        const err = new Error(`Cannot rearrange chapters: an invalid chapter array was received.`)
        res.status(400).send(err)
        throw err
      }

      return dbChapterOrder.update({
        order: chapterIds
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

  // POST { fileId, chapterId }
  app.post(route('chapter/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const chapterId = req.body.chapterId
    const userId = req.user.id
    let dbDocId

    db.Doc.findOne({
      where: {
        guid: documentId,
        userId
      }
    }).then(dbDoc => {
      dbDocId = dbDoc.id
      return db.Chapter.findOne({
        where: {
          documentId: dbDocId,
          guid: chapterId,
          userId
        }
      })
    }).then(dbChapter => {
      return db.ChapterTopic.destroy({
        where: {
          chapterId: dbChapter.id,
          userId
        }
      })
    }).then(() => {
      return db.Chapter.destroy({
        where: {
          documentId: dbDocId,
          guid: chapterId,
          userId
        }
      })
    }).then(() => {
      return db.ChapterOrder.findOne({
        where: {
          ownerGuid: documentId,
          userId
        }
      })
    }).then(dbChapterOrder => {
      const indexToRemove = dbChapterOrder.order.indexOf(chapterId)

      if (~indexToRemove) {
        dbChapterOrder.order.splice(indexToRemove, 1)
        return dbChapterOrder.update({
          order: dbChapterOrder.order
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

    db.ChapterOrder.findCreateFind({
      where: {
        ownerGuid: documentId,
        userId
      },
      defaults: {
        order: [],
        ownerGuid: documentId,
        userId
      }
    }).then(([dbChapterOrder]) => {
      chapterOrder = dbChapterOrder
      return db.Chapter.findAll({
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
    }).then(dbChapters => {
      chapters = dbChapters

      let orderOutOfDate = false
      chapters.forEach(chapter => {
        if (!chapterOrder.order.includes(chapter.guid)) {
          orderOutOfDate = true
          chapterOrder.order.push(chapter.guid)
        }
      })

      if (orderOutOfDate) {
        return chapterOrder.update({
          order: chapterOrder.order
        })
      }

      return orderOutOfDate
    }).then(() => {
      const chapterPromises = chapters.map(chapter => {
        return db.ChapterTopic.findAll({
          where: {
            chapterId: chapter.id,
            userId
          }
        }).then((chapterTopics = []) => {
          const topicPromises = chapterTopics.map(chapterTopic => {
            return db.MasterTopic.findOne({
              where: {
                id: chapterTopic.masterTopicId,
                userId
              }
            }).then(dbMasterTopic => {
              chapterTopic.guid = dbMasterTopic.guid
              chapterTopic.setDataValue('guid', dbMasterTopic.guid)
              return chapterTopic
            })
          })

          return Promise.all(topicPromises)
        }).then(chapterTopics => {
          const topics = chapter.topics || {}

          chapterTopics.forEach(topic => {
            topics[topic.guid] = topic
          })

          chapter.setDataValue('topics', topics)

          return chapter
        })
      })

      return Promise.all(chapterPromises)
    }).then(chaptersWithTopics => {
      chaptersWithTopics.sort((chapter1, chapter2) => {
        return chapterOrder.order.indexOf(chapter1.guid) - chapterOrder.order.indexOf(chapter2.guid)
      })

      res.status(200).send(chaptersWithTopics)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updateChapter }
