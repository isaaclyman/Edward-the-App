const isEqual = require('lodash/isEqual')
const ts = require('../models/_util').addTimestamps
const utilities = require('../api/utilities')
const getDocId = utilities.getDocId

const updateWorkshop = function (db, userId, docGuid, workshop) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  // Upsert the workshop content
  return utilities.upsert(db.knex, 'workshop_content', {
    where: {
      guid: workshop.guid,
      document_id: docId(),
      user_id: userId
    },
    insert: ts(db.knex, {
      archived: workshop.archived,
      content: workshop.content,
      date: workshop.date,
      guid: workshop.guid,
      order: workshop.order,
      title: workshop.title,
      workshop_name: workshop.workshopName,
      user_id: userId,
      document_id: docId()
    }),
    getUpdate: dbWorkshop => {
      const update = {
        archived: workshop.archived,
        // Only update content if it has changed
        content: !isEqual(dbWorkshop.content, workshop.content) ? workshop.content : undefined
        // Never update workshop name, order, title or date
      }

      return ts(db.knex, update, true)
    }
  })
}

const getWorkshops = function (db, userId, docGuid) {
  const docId = () => getDocId(db.knex, userId, docGuid)

  return db.knex('workshop_content').where({
    document_id: docId(),
    user_id: userId
  }).select({
    archived: 'archived',
    content: 'content',
    createdDate: 'created_at',
    date: 'date',
    guid: 'guid',
    order: 'order',
    title: 'title',
    workshopName: 'workshop_name'
  }).orderBy('workshop_name').orderBy('order', 'asc')
}

const registerApis = function (app, passport, db, isPremiumUser) {
  const route = route => `/api/${route}`

  // POST { documentGuid, guid }
  app.post(route('workshop-content/delete'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const docGuid = req.body.documentGuid
    const guid = req.body.guid

    const docId = () => getDocId(db.knex, userId, docGuid)

    return db.knex('workshop_content').where({
      guid: guid,
      document_id: docId(),
      user_id: userId
    }).del().then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // POST { documentGuid, workshops: [{
  //   guid, title, workshopName, content, archived, date
  // }] }
  app.post(route('workshop-content/update'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const { documentGuid, workshops } = req.body

    Promise.all(workshops.map(workshop => updateWorkshop(db, userId, documentGuid, workshop))).then(() => {
      res.status(200).send(`Workshop contents updated.`)
    }, err => {
      console.error(err)
      res.status(500).send(err)
    })
  })

  // GET
  app.get(route('workshop-content/:documentGuid'), isPremiumUser, (req, res, next) => {
    const userId = req.user.id
    const documentGuid = req.params.documentGuid

    getWorkshops(db, userId, documentGuid).then(workshops => {
      res.status(200).send(workshops)
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })
}

module.exports = { updateWorkshop, registerApis }
