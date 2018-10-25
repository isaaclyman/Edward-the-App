const isEqual = require('lodash/isEqual')
const ts = require('../models/_util').addTimestamps
const utilities = require('./api_util')
const getPlanId = utilities.getPlanId

const updateSection = (db, userId, docGuid, planGuid, section) => {
  const planId = () => getPlanId(db.knex, userId, docGuid, planGuid)

  return utilities.upsert(db.knex, 'sections', {
    where: {
      guid: section.guid,
      'plan_id': planId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: section.archived,
      content: section.content,
      guid: section.guid,
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
        order: JSON.stringify([section.guid]),
        'plan_id': planId(),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(section.guid)) {
          order.push(section.guid)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
    })
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, planGuid, sectionGuids }
  app.post(route('section/arrange'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const planGuid = req.body.planGuid
    const sectionGuids = req.body.sectionGuids
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

  // POST { documentGuid, planGuid, sectionGuid }
  app.post(route('section/delete'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const planGuid = req.body.planGuid
    const sectionGuid = req.body.sectionGuid
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

  // POST { documentGuid, planGuid, sectionGuid, section: {
  //   archived, content, guid, tags, title
  // } }
  app.post(route('section/update'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const planGuid = req.body.planGuid
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
