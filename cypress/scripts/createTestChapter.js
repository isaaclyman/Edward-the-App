require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const chapGuid = guid()

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)
const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

knex('chapters').insert({
  archived: false,
  content: null,
  guid: chapGuid,
  title: 'test',
  'user_id': userId,
  'document_id': docId
}).then(() => {
  return knex('chapter_orders').insert({
    order: JSON.stringify([chapGuid]),
    'document_id': docId,
    'user_id': userId
  })
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
