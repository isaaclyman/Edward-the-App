exports.up = function(knex, Promise) {
  return (
    fixOrderColumn(knex, 'document_orders')
    .then(() => fixOrderColumn(knex, 'chapter_orders'))
    .then(() => fixOrderColumn(knex, 'master_topic_orders'))
    .then(() => fixOrderColumn(knex, 'plan_orders'))
    .then(() => fixOrderColumn(knex, 'section_orders'))
  )
}

exports.down = function(knex, Promise) {
  return (
    unfixOrderColumn(knex, 'document_orders')
    .then(() => unfixOrderColumn(knex, 'chapter_orders'))
    .then(() => unfixOrderColumn(knex, 'master_topic_orders'))
    .then(() => unfixOrderColumn(knex, 'plan_orders'))
    .then(() => unfixOrderColumn(knex, 'section_orders'))
  )
}

function fixOrderColumn (knex, table) {
  return knex.schema.alterTable(table, function (t) {
    t.text('order').alter()
  })
}

function unfixOrderColumn (knex, table) {
  return knex.schema.alterTable(table, function (t) {
    t.string('order').alter()
  })
}
