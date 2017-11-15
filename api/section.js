const utilities = require('../api/utilities')

module.exports = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, planId, sectionIds }
  app.post(route('section/arrange'), isPremiumUser, (req, res, next) => {
    const planId = req.body.planId
    const sectionIds = req.body.sectionIds
    const userId = req.user.id

    db.SectionOrder.findOne({
      where: {
        ownerGuid: planId,
        userId
      }
    }).then(dbSectionOrder => {
      if (!utilities.containSameElements(dbSectionOrder.order, sectionIds)) {
        const err = new Error(`Cannot rearrange sections: an invalid section array was received.`)
        res.status(400).send(err)
        throw err
      }

      return dbSectionOrder.update({
        order: sectionIds
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

  // POST { fileId, planId, sectionId }
  app.post(route('section/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const planId = req.body.planId
    const sectionId = req.body.sectionId
    const userId = req.user.id
    let dbDocId

    db.Doc.findOne({
      where: {
        guid: documentId,
        userId
      }
    }).then(dbDoc => {
      dbDocId = dbDoc.id
      return db.Plan.findOne({
        where: {
          documentId: dbDocId,
          guid: planId,
          userId
        }
      })
    }).then(dbPlan => {
      return db.Section.destroy({
        where: {
          guid: sectionId,
          planId: dbPlan.id,
          userId
        }
      })
    }).then(() => {
      return db.SectionOrder.findOne({
        where: {
          ownerGuid: planId,
          userId
        }
      })
    }).then(dbSectionOrder => {
      const indexToRemove = dbSectionOrder.order.indexOf(sectionId)
      
      if (~indexToRemove) {
        dbSectionOrder.order.splice(indexToRemove, 1)
        return dbSectionOrder.update({
          order: dbSectionOrder.order
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

  // POST { fileId, planId, sectionId, section: {
  //   archived, content, id, tags, title
  // } }
  app.post(route('section/update'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const planId = req.body.planId
    const section = req.body.section
    const userId = req.user.id

    db.Doc.findOne({
      where: {
        guid: documentId,
        userId
      }
    }).then(dbDoc => {
      return db.Plan.findOne({
        where: {
          documentId: dbDoc.id,
          guid: planId,
          userId
        }
      })
    }).then(dbPlan => {
      return db.Section.findCreateFind({
        where: {
          guid: section.id,
          planId: dbPlan.id,
          userId
        },
        defaults: {
          archived: false,
          content: null,
          guid: section.id,
          planId: dbPlan.id,
          tags: [],
          title: '',
          userId
        }
      })
    }).then(([dbSection]) => {
      const update = {
        archived: section.archived,
        content: section.content,
        tags: section.tags,
        title: section.title
      }

      return dbSection.update(update)
    }).then(() => {
      return db.SectionOrder.findCreateFind({
        where: {
          ownerGuid: planId,
          userId
        },
        defaults: {
          order: [],
          ownerGuid: planId,
          userId
        }
      })
    }).then(([dbSectionOrder]) => {
      if (dbSectionOrder.order.includes(section.id)) {
        return section.id
      }

      dbSectionOrder.order.push(section.id)
      return dbSectionOrder.update({
        order: dbSectionOrder.order
      })
    }).then(() => {
      res.status(200).send(`Section "${section.title}" updated.`)
    }, err => {
      console.error(err)

      if (res.headersSent) {
        return
      }

      res.status(500).send(err)
    })
  })
}
