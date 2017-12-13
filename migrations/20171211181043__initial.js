const accountTypes = require('../models/accountType')

exports.up = function (knex, Promise) {
  return (
    userTable(knex)
    .then(() => docTable(knex))
    .then(() => docOrderTable(knex))
    .then(() => chapterTable(knex))
    .then(() => chapterOrderTable(knex))
    .then(() => masterTopicTable(knex))
    .then(() => masterTopicOrderTable(knex))
    .then(() => chapterTopicTable(knex))
    .then(() => planTable(knex))
    .then(() => planOrderTable(knex))
    .then(() => sectionTable(knex))
    .then(() => sectionOrderTable(knex))
  )
}

exports.down = function (knex, Promise) {
  return (
    knex.schema
    .dropTableIfExists('section_orders')
    .dropTableIfExists('sections')
    .dropTableIfExists('plan_orders')
    .dropTableIfExists('plans')
    .dropTableIfExists('chapter_topics')
    .dropTableIfExists('master_topic_orders')
    .dropTableIfExists('master_topics')
    .dropTableIfExists('chapter_orders')
    .dropTableIfExists('chapters')
    .dropTableIfExists('document_orders')
    .dropTableIfExists('documents')
    .dropTableIfExists('users')
  )
}

function userIdCol (t) {
  t.integer('user_id').notNullable()
  t.foreign('user_id').references('users.id')
}

function docIdCol (t) {
  t.integer('document_id').notNullable()
  t.foreign('document_id').references('documents.id')
}

function chapterIdCol (t) {
  t.integer('chapter_id').notNullable()
  t.foreign('chapter_id').references('chapters.id')
}

function masterTopicIdCol (t) {
  t.integer('master_topic_id').notNullable()
  t.foreign('master_topic_id').references('master_topics.id')
}

function planIdCol (t) {
  t.integer('plan_id').notNullable()
  t.foreign('plan_id').references('plans.id')
}

function userTable (knex) {
  return knex.schema.createTable('users', t => {
    t.increments('id').primary()
    t.string('email').unique().notNullable()
    t.string('password').notNullable()
    t.enu('account_type', Object.keys(accountTypes)).notNullable()
    t.timestamps()
  })
}

function docTable (knex) {
  return knex.schema.createTable('documents', t => {
    t.increments('id').primary()
    t.uuid('guid').notNullable()
    t.string('name')
    t.timestamps()
    userIdCol(t)
  })
}

function docOrderTable (knex) {
  return knex.schema.createTable('document_orders', t => {
    t.increments('id').primary()
    t.string('order')
    t.timestamps()
    userIdCol(t)
  })
}

function chapterTable (knex) {
  return knex.schema.createTable('chapters', t => {
    t.increments('id').primary()
    t.boolean('archived').notNullable()
    t.json('content')
    t.uuid('guid').notNullable()
    t.string('title')
    t.timestamps()
    userIdCol(t)
    docIdCol(t)
  })
}

function chapterOrderTable (knex) {
  return knex.schema.createTable('chapter_orders', t => {
    t.increments('id').primary()
    t.uuid('owner_guid').notNullable()
    t.string('order')
    t.timestamps()
    userIdCol(t)
  })
}

function masterTopicTable (knex) {
  return knex.schema.createTable('master_topics', t => {
    t.increments('id').primary()
    t.boolean('archived').notNullable()
    t.uuid('guid').notNullable()
    t.string('title')
    t.timestamps()
    userIdCol(t)
    docIdCol(t)
  })
}

function masterTopicOrderTable (knex) {
  return knex.schema.createTable('master_topic_orders', t => {
    t.increments('id').primary()
    t.uuid('owner_guid').notNullable()
    t.string('order')
    t.timestamps()
    userIdCol(t)
  })
}

function chapterTopicTable (knex) {
  return knex.schema.createTable('chapter_topics', t => {
    t.increments('id').primary()
    t.json('content')
    t.timestamps()
    userIdCol(t)
    chapterIdCol(t)
    masterTopicIdCol(t)
  })
}

function planTable (knex) {
  return knex.schema.createTable('plans', t => {
    t.increments('id').primary()
    t.boolean('archived').notNullable()
    t.uuid('guid').notNullable()
    t.string('title')
    t.timestamps()
    userIdCol(t)
    docIdCol(t)
  })
}

function planOrderTable (knex) {
  return knex.schema.createTable('plan_orders', t => {
    t.increments('id').primary()
    t.uuid('owner_guid').notNullable()
    t.string('order')
    t.timestamps()
    userIdCol(t)
  })
}

function sectionTable (knex) {
  return knex.schema.createTable('sections', t => {
    t.increments('id').primary()
    t.boolean('archived').notNullable()
    t.uuid('guid').notNullable()
    t.string('tags')
    t.string('title')
    t.timestamps()
    userIdCol(t)
    planIdCol(t)
  })
}

function sectionOrderTable (knex) {
  return knex.schema.createTable('section_orders', t => {
    t.increments('id').primary()
    t.uuid('owner_guid').notNullable()
    t.string('order')
    t.timestamps()
    userIdCol(t)
  })
}