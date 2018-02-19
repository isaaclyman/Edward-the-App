exports.up = function(knex, Promise) {
  return knex.schema.createTable('all_user_emails', t => {
    t.increments('id').primary()
    t.string('subject').notNullable()
    t.text('content').notNullable()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('all_user_emails')
}
