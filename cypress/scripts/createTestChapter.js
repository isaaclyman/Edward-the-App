require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const chapGuids = [guid(), guid(), guid()]

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)
const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)

const chapter = (index) => ({
  archived: false,
  content: null,
  guid: chapGuids[index - 1],
  title: `test chapter ${index}`,
  'user_id': userId,
  'document_id': docId
})

knex('chapters').insert([chapter(1), chapter(2), chapter(3)]).then(() => {
  return knex('chapter_orders').insert({
    order: JSON.stringify(chapGuids),
    'document_id': docId,
    'user_id': userId
  })
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
