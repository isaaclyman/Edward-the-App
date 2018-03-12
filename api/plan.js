const difference = require('lodash/difference')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getDocId = utilities.getDocId

const updatePlan = (db, userId, docGuid, plan) => {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return utilities.upsert(db.knex, 'plans', {
    where: {
      guid: plan.guid,
      'document_id': docId(),
      'user_id': userId
    },
    insert: ts(db.knex, {
      archived: plan.archived,
      guid: plan.guid,
      title: plan.title,
      'document_id': docId(),
      'user_id': userId
    }),
    update: ts(db.knex, {
      archived: plan.archived,
      title: plan.title
    }, true)
  }).then(() => {
    return utilities.upsert(db.knex, 'plan_orders', {
      where: {
        'document_id': docId(),
        'user_id': userId
      },
      insert: ts(db.knex, {
        order: JSON.stringify([plan.guid]),
        'document_id': docId(),
        'user_id': userId
      }),
      getUpdate: dbOrder => {
        const order = JSON.parse(dbOrder.order || '[]')
        if (!order.includes(plan.guid)) {
          order.push(plan.guid)
          return ts(db.knex, { order: JSON.stringify(order) }, true)
        }

        return null
      }
    })
  })
}

const getPlans = (db, userId, docGuid) => {
  let planOrder, plans

  const docId = () => getDocId(db.knex, userId, docGuid)

  return Promise.all([
    db.knex('plan_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order = '[]' } = {}) => { return JSON.parse(order) }),
    db.knex('plans').where({
      'document_id': docId(),
      'user_id': userId
    }).select()
  ]).then(([_planOrder, _plans]) => {
    planOrder = _planOrder
    plans = _plans

    const missingPlans = difference(plans.map(p => p.guid), planOrder)
    if (missingPlans.length) {
      const order = planOrder.concat(missingPlans)
      return db.knex('plan_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, { order: JSON.stringify(order) }, true))
    }

    return
  }).then(() => {
    return Promise.all([
      db.knex('section_orders').where({
        'user_id': userId
      }).whereIn('plan_id', plans.map(p => p.id)).select(),
      db.knex('sections').where({
        'user_id': userId
      }).whereIn('plan_id', knex => {
        knex.select('id').from('plans').where({
          'document_id': docId(),
          'user_id': userId
        })
      }).select().then(sections => sections.map(section => {
        section.tags = JSON.parse(section.tags)
        return section
      }))
    ])
  }).then(([sectionOrders, sections]) => {
    const sectionOrdersByPlan = sectionOrders.reduce((dict, order) => {
      dict[order['plan_id']] = (order.order || [])
      return dict
    }, {})

    const sectionsByPlan = sections.reduce((dict, section) => {
      const sections = dict[section['plan_id']] || []
      sections.push(section)
      dict[section['plan_id']] = sections
      return dict
    }, {})

    for (const planId in sectionsByPlan) {
      const order = sectionOrdersByPlan[planId] || []

      sectionsByPlan[planId].sort((section1, section2) => {
        return order.indexOf(section1.guid) - order.indexOf(section2.guid)
      })
    }

    for (const plan of plans) {
      plan.sections = (sectionsByPlan[plan.id] || [])
    }

    plans.sort((plan1, plan2) => {
      return planOrder.indexOf(plan1.guid) - planOrder.indexOf(plan2.guid)
    })

    return plans
  })
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, planGuids }
  app.post(route('plan/arrange'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const planGuids = req.body.planGuids
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, docGuid)

    db.knex('plan_orders').where({
      'document_id': docId(),
      'user_id': userId
    }).first('order').then(({ order }) => {
      if (!utilities.containSameElements(JSON.parse(order), planGuids)) {
        throw new Error(`Cannot rearrange plans: an invalid plan array was received.`)
      }

      return db.knex('plan_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).update(ts(db.knex, {
        order: JSON.stringify(planGuids)
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, planGuid }
  app.post(route('plan/delete'), isPremiumUser, (req, res, next) => {
    const docGuid = req.body.documentGuid
    const planGuid = req.body.planGuid
    const userId = req.user.id

    const docId = () => getDocId(db.knex, userId, docGuid)

    db.knex('sections').where({
      'user_id': userId
    }).whereIn('plan_id', knex => {
      knex.select('id').from('plans').where({
        guid: planGuid,
        'document_id': docId(),
        'user_id': userId
      })
    }).del().then(() => {
      return db.knex('plans').where({
        guid: planGuid,
        'document_id': docId(),
        'user_id': userId
      }).del()
    }).then(() => {
      return db.knex('plan_orders').where({
        'document_id': docId(),
        'user_id': userId
      }).first('order')
    }).then(({ order: planOrder }) => {
      // Splice plan from order
      const order = JSON.parse(planOrder || '[]')
      const indexToRemove = order.indexOf(planGuid)

      if (~indexToRemove) {
        order.splice(indexToRemove, 1)
        return db.knex('plan_orders').where({
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

  // POST { documentGuid, planGuid, plan: {
  //   archived, guid, title, sections: [{
  //     archived, content, guid, tags, title
  //   }]
  // } }
  app.post(route('plan/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const docGuid = req.body.documentGuid
    const plan = req.body.plan

    updatePlan(db, userId, docGuid, plan).then(() => {
      res.status(200).send(`Plan "${plan.title}" updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('plans/:documentGuid'), isPremiumUser, (req, res, next) => {
    const docGuid = req.params.documentGuid
    const userId = req.user.id

    getPlans(db, userId, docGuid).then(plans => {
      res.status(200).send(plans)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })
}

module.exports = { getPlans, registerApis, updatePlan }
