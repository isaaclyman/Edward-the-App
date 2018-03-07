const writingTools = require('../models/writingTool')

exports.up = function(knex, Promise) {
  return toolContentTable(knex)
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('tool_content')
}

function toolContentTable (knex) {
  return knex.schema.createTable('tool_content', t => {
    t.increments('id').primary()
    t.uuid('guid').notNullable()
    t.integer('order')
    t.string('title')
    t.enu('tool_name', Object.keys(writingTools)).notNullable()
    t.boolean('archived').notNullable()
    t.json('content')
    t.date('date')
    userIdCol(t)
    docIdCol(t)
    t.timestamps()
  })
}

function userIdCol (t) {
  t.integer('user_id').notNullable()
  t.foreign('user_id').references('users.id').onDelete('CASCADE')
}

function docIdCol (t) {
  t.integer('document_id').notNullable()
  t.foreign('document_id').references('documents.id').onDelete('CASCADE')
}