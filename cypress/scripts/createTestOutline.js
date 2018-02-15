require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)
const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

const topicGuid = guid()

knex('master_topics').insert({
  archived: false,
  guid: topicGuid,
  title: 'test topic 1',
  user_id: userId,
  document_id: docId
}).returning('id').then(ids => {
  return knex('master_topic_orders').insert({
    order: JSON.stringify([topicGuid]),
    user_id: userId,
    document_id: docId
  })
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
