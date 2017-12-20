const isEqual = require('lodash/isEqual')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getPlanId = utilities.getPlanId

const updateSection = (db, userId, docGuid, planGuid, section) => {
  const planId = () => getPlanId(db.knex, userId, docGuid, planGuid)

  return utilities.upsert(db.knex, 'sections', {
    where: {
      guid: section.id,
      'plan_id': planId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: section.archived,
      content: section.content,
      guid: section.id,
      tags: JSON.stringify(section.tags),
      title: section.title,
      'plan_id': planId(),
      'user_id': userId
    }),
    getUpdate: dbSection => {
      const update = {
        archived: section.archived,
        content: !isEqual(dbSection.content, section.content) ? section.content : undefined,
        tags: JSON.stringify(section.tags),
        title: section.title
      }

      return ts(db.knex, update, true)
    }
  }).then(() => {
    return utilities.upsert(db.knex, 'section_orders', {
      where: {
        'plan_id': planId(),
        'user_id': userId
      },
      insert: ts(db.knex, {
        order: JSON.stringify([section.id]),
        'plan_id': planId(),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(section.id)) {
          order.push(section.id)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
    })
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { fileId, planId, sectionIds }
  app.post(route('section/arrange'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.fileId
    const planGuid = req.body.planId
    const sectionGuids = req.body.sectionIds
    const userId = req.user.id

    const planId = () => getPlanId(db.knex, userId, docGuid, planGuid)

    db.knex('section_orders').where({
      'plan_id': planId(),
      'user_id': userId
    }).first('order').then(({ order }) => {
      if (!utilities.containSameElements(JSON.parse(order), sectionGuids)) {
        throw new Error(`Cannot rearrange sections: an invalid section array was received.`)
      }

      return db.knex('section_orders').where({
        'plan_id': planId(),
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(sectionGuids)
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { fileId, planId, sectionId }
  app.post(route('section/delete'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.fileId
    const planGuid = req.body.planId
    const sectionGuid = req.body.sectionId
    const userId = req.user.id

    const planId = () => getPlanId(db.knex, userId, docGuid, planGuid)

    db.knex('sections').where({
      guid: sectionGuid,
      'plan_id': planId(),
      'user_id': userId
    }).del().then(() => {
      return db.knex('section_orders').where({
        'plan_id': planId(),
        'user_id': userId
      })
    }).then(({ order: sectionOrder }) => {
      // Splice section from order
      const order = JSON.parse(sectionOrder || '[]')
      const indexToRemove = order.indexOf(sectionGuid)

      if (~indexToRemove) {
        order.splice(indexToRemove, 1)
        return db.knex('section_orders').where({
          'plan_id': planId(),
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

  // POST { fileId, planId, sectionId, section: {
  //   archived, content, id, tags, title
  // } }
  app.post(route('section/update'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.fileId
    const planGuid = req.body.planId
    const section = req.body.section
    const userId = req.user.id

    updateSection(db, userId, docGuid, planGuid, section).then(() => {
      res.status(200).send(`Section "${section.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { registerApis, updateSection }
