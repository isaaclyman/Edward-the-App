const util = require('../../../compiled/test_util')
const guid = require('uuid/v1')

module.exports = (knex) => {
  const userQuery = `(SELECT id FROM users WHERE email = '${util.user.email}' LIMIT 1)`
  const userId = knex.raw(userQuery)
  const docId = knex.raw(`(SELECT id FROM documents WHERE user_id = ${userQuery} LIMIT 1)`)
  const chapId = knex.raw(`(SELECT id FROM chapters WHERE user_id = ${userQuery} LIMIT 1)`)

  const topicGuid = guid()

  return knex('master_topics').insert({
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
    }).then(() => ids)
  }).then(ids => {
    return knex('chapter_topics').insert({
      content: { ops: [{ insert: 'test outline content searchable' }] },
      user_id: userId,
      chapter_id: chapId,
      master_topic_id: ids[0]
    })
  })
}
