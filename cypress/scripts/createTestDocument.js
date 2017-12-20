require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const docGuid = guid()

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)

knex('documents').insert({
  guid: docGuid,
  name: 'test',
  'user_id': userId
}).then(() => {
  return knex('document_orders').insert({
    order: JSON.stringify([docGuid]),
    'user_id': userId
  })
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
