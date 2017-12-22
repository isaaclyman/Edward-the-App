require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)
const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

const planGuids = [guid(), guid()]
const plan = index => ({
  archived: false,
  guid: planGuids[index - 1],
  title: `test plan ${index}`,
  'user_id': userId,
  'document_id': docId
})

const sectionGuids = [guid(), guid(), guid()]
const section = (index, planId) => ({
  archived: false,
  content: null,
  guid: sectionGuids[index - 1],
  tags: '[]',
  title: `test section ${index}`,
  'user_id': userId,
  'plan_id': planId
})

knex('plans').insert([plan(1), plan(2)]).returning('id').then(ids => {
  return knex('plan_orders').insert({
    order: JSON.stringify(planGuids),
    'document_id': docId,
    'user_id': userId
  }).then(() => ids)
}).then(ids => {
  return knex('sections').insert([
    section(1, ids[0]),
    section(2, ids[1]),
    section(3, ids[1])
  ]).then(() => ids)
}).then(ids => {
  return knex('section_orders').insert([{
    order: JSON.stringify([sectionGuids[0]]),
    'plan_id': ids[0],
    'user_id': userId
  }, {
    order: JSON.stringify([sectionGuids[1], sectionGuids[2]]),
    'plan_id': ids[1],
    'user_id': userId
  }])
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
