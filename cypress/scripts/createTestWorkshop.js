require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')
const writingWorkshops = require('../../models/writingWorkshop')

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)
const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

const workshopGuids = [guid(), guid()]
const workshop = index => ({
  archived: false,
  guid: workshopGuids[index - 1],
  order: index - 1,
  title: `test workshop ${index}`,
  workshop_name: writingWorkshops.FREE_WRITE.name,
  content: null,
  user_id: userId,
  document_id: docId
})

knex('workshop_content').insert([workshop(1), workshop(2)]).returning('id').then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
