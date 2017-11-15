const utilities = require('../api/utilities')

const updatePlan = (db, userId, documentId, plan) => {
  return db.Doc.findOne({
    where: {
      guid: documentId,
      userId
    }
  }).then(dbDoc => {
    return db.Plan.findCreateFind({
      where: {
        documentId: dbDoc.id,
        guid: plan.id,
        userId
      },
      defaults: {
        archived: false,
        documentId: dbDoc.id,
        guid: plan.id,
        title: '',
        userId
      }
    })
  }).then(([dbPlan]) => {
    const update = {
      archived: plan.archived,
      title: plan.title
    }

    return dbPlan.update(update)
  }).then(() => {
    return db.PlanOrder.findCreateFind({
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
  }).then(([dbPlanOrder]) => {
    if (dbPlanOrder.order.includes(plan.id)) {
      return plan.id
    }

    dbPlanOrder.order.push(plan.id)
    return dbPlanOrder.update({
      order: dbPlanOrder.order
    })
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, planIds }
  app.post(route('plan/arrange'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const planIds = req.body.planIds
    const userId = req.user.id

    db.PlanOrder.findOne({
      where: {
        ownerGuid: documentId,
        userId
      }
    }).then(dbPlanOrder => {
      if (!utilities.containSameElements(dbPlanOrder.order, planIds)) {
        const err = new Error(`Cannot rearrange plans: an invalid plan array was received.`)
        res.status(400).send(err)
        throw err
      }

      return dbPlanOrder.update({
        order: planIds
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

  // POST { fileId, planId }
  app.post(route('plan/delete'), isPremiumUser, (req, res, next) => {
    const documentId = req.body.fileId
    const planId = req.body.planId
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
          planId: dbPlan.id,
          userId
        }
      })
    }).then(() => {
      return db.Plan.destroy({
        where: {
          documentId: dbDocId,
          guid: planId,
          userId
        }
      })
    }).then(() => {
      return db.PlanOrder.findOne({
        where: {
          ownerGuid: documentId,
          userId
        }
      })
    }).then(dbPlanOrder => {
      const indexToRemove = dbPlanOrder.order.indexOf(planId)

      if (~indexToRemove) {
        dbPlanOrder.order.splice(indexToRemove, 1)
        return dbPlanOrder.update({
          order: dbPlanOrder.order
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

  // POST { fileId, planId, plan: {
  //   archived, id, title, sections: [{
  //     archived, content, id, tags, title
  //   }]
  // } }
  app.post(route('plan/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentId = req.body.fileId
    const plan = req.body.plan

    updatePlan(db, userId, documentId, plan).then(() => {
      res.status(200).send(`Plan "${plan.title}" updated.`)
    }, err => {
      console.error(err)

      if (res.headersSent) {
        return
      }

      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('plans/:documentId'), isPremiumUser, (req, res, next) => {
    const documentId = req.params.documentId
    const userId = req.user.id
    let planOrder, plans

    db.PlanOrder.findCreateFind({
      where: {
        ownerGuid: documentId,
        userId
      },
      defaults: {
        order: [],
        ownerGuid: documentId,
        userId
      }
    }).then(([dbPlanOrder]) => {
      planOrder = dbPlanOrder
      return db.Plan.findAll({
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
    }).then(dbPlans => {
      plans = dbPlans

      let orderOutOfDate = false
      plans.forEach(plan => {
        if (!planOrder.order.includes(plan.guid)) {
          orderOutOfDate = true
          planOrder.order.push(plan.guid)
        }
      })

      if (orderOutOfDate) {
        return planOrder.update({
          order: planOrder.order
        })
      }

      return orderOutOfDate
    }).then(() => {
      const planPromises = plans.map(plan => {
        let sectionOrder, sections

        return db.SectionOrder.findCreateFind({
          where: {
            ownerGuid: plan.guid,
            userId
          },
          defaults: {
            order: [],
            ownerGuid: plan.guid,
            userId
          }
        }).then(([dbSectionOrder]) => {
          sectionOrder = dbSectionOrder
          return db.Section.findAll({
            where: {
              planId: plan.id,
              userId
            }
          })
        }).then(dbSections => {
          sections = dbSections

          let orderOutOfDate = false
          sections.forEach(section => {
            if (!sectionOrder.order.includes(section.guid)) {
              orderOutOfDate = true
              sectionOrder.order.push(section.guid)
            }
          })

          if (orderOutOfDate) {
            return sectionOrder.update({
              order: sectionOrder.order
            })
          }

          return orderOutOfDate
        }).then(() => {
          sections.sort((section1, section2) => {
            return sectionOrder.order.indexOf(section1.guid) - sectionOrder.order.indexOf(section2.guid)
          })

          plan.setDataValue('sections', sections)

          return plan
        })
      })

      return Promise.all(planPromises)
    }).then(plansWithSections => {
      plansWithSections.sort((plan1, plan2) => {
        return planOrder.order.indexOf(plan1.guid) - planOrder.order.indexOf(plan2.guid)
      })

      res.status(200).send(plansWithSections)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updatePlan }
