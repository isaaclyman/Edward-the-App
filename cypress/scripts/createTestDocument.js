require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')
const guid = require('uuid/v1')

const docGuid1 = guid()
const docGuid2 = guid()

const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
const userId = knex.raw(userQuery)

knex('documents').insert([{
  guid: docGuid1,
  name: 'test',
  'user_id': userId
}, {
  guid: docGuid2,
  name: 'test2',
  'user_id': userId
}]).then(() => {
  return knex('document_orders').insert({
    order: JSON.stringify([docGuid1, docGuid2]),
    'user_id': userId
  })
}).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
