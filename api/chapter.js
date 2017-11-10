const isEqual = require('lodash/isEqual')
const utilities = require('../api/utilities')

module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, chapterIds }
  app.post(route('chapter/arrange'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const chapterIds = req.body.chapterIds
    const userId = req.user.id

    db.ContentOrder.findOne({
      where: {
        ownerGuid: documentId,
        userId
      }
    }).then(dbContentOrder => {
      if (!utilities.containSameElements(dbContentOrder.order, chapterIds)) {
        const err = new Error(`Cannot rearrange chapters: an invalid chapter array was received.`)
        res.status(400).send(err)
        throw err
      }

      return dbContentOrder.update({
        order: chapterIds
      })
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

    db.Chapter.findOne({
      where: {
        guid: chapterId,
        userId
      }
    }).then(dbChapter => {
      return db.ChapterTopic.destroy({
        where: {
          chapterId: dbChapter.id,
          userId
        }
      })
    }).then(() => {
      return db.Doc.findOne({
        where: {
          guid: documentId,
          userId
        }
      })
    }).then(dbDocument => {
      return db.Chapter.destroy({
        where: {
          documentId: dbDocument.id,
          guid: chapterId,
          userId
        }
      })
    }).then(() => {
      return db.ContentOrder.findOne({
        where: {
          ownerGuid: documentId,
          userId
        }
      })
    }).then(dbContentOrder => {
      const indexToRemove = dbContentOrder.order.indexOf(chapterId)

      if (~indexToRemove) {
        dbContentOrder.order.splice(indexToRemove, 1)
        return dbContentOrder.save()
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
    const documentId = req.body.fileId
    const chapter = req.body.chapter
    const userId = req.user.id
    let dbChapterId

    db.Chapter.findCreateFind({
      where: {
        guid: chapter.id,
        userId
      },
      include: [{
        model: db.Doc,
        where: {
          guid: documentId
        }
      }],
      defaults: {
        guid: chapter.id,
        userId
      }
    }).then(([dbChapter, created]) => {
      dbChapterId = dbChapter.id
      const update = {
        archived: chapter.archived,
        content: chapter.content,
        title: chapter.title
      }

      const document = dbChapter['document']
      if (created) {
        update.documentId = document.id
      }

      return dbChapter.update(update)
    }).then(() => {
      return db.ContentOrder.findOne({
        where: {
          ownerGuid: documentId,
          userId
        }
      })
    }).then(dbContentOrder => {
      if (dbContentOrder.order.includes(chapter.id)) {
        return chapter.id
      }

      dbContentOrder.order.push(chapter.id)
      return dbContentOrder.save()
    }).then(() => {
      const topics = chapter.topics
      const topicPromises = Object.keys(topics).map(id => {
        const topic = topics[id]
        return db.MasterTopic.findOne({
          where: {
            guid: topic.id,
            userId
          }
        }).then(dbMasterTopic => {
          if (!dbMasterTopic) {
            const error = new Error(`MasterTopic ${topic.id} was not found.`)
            res.status(500).send(error)
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
    }).then(() => {
      res.status(200).send(`Chapter ${chapter.title} created.`)
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

    db.ContentOrder.findOne({
      where: {
        ownerGuid: documentId,
        userId
      }
    }).then(dbContentOrder => {
      chapterOrder = dbContentOrder
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
        if (!~chapterOrder.order.indexOf(chapter.guid)) {
          orderOutOfDate = true
          chapterOrder.order.push(chapter.guid)
        }
      })

      if (orderOutOfDate) {
        return chapterOrder.save()
      }

      return orderOutOfDate
    }).then(() => {
      chapters.sort((chapter1, chapter2) => {
        return chapterOrder.order.indexOf(chapter1.guid) - chapterOrder.order.indexOf(chapter2.guid)
      })

      res.status(200).send(chapters)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}
