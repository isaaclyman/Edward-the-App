const writingWorkshops = require('../models/writingWorkshop')

exports.up = function(knex) {
  return workshopContentTable(knex)
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workshop_content')
}

function workshopContentTable (knex) {
  return knex.schema.createTable('workshop_content', (t) => {
    t.increments('id').primary()
    // Duplicate guids are allowed in order to group workshop content together
    t.uuid('guid').notNullable()
    t.integer('order')
    t.string('title')
    t.enu('workshop_name', Object.keys(writingWorkshops)).notNullable()
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