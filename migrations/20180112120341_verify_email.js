exports.up = function(knex, Promise) {
  return (
    knex.schema.table('users', table => {
      table.uuid('verify_key')
      table.boolean('verified').notNullable().defaultTo(false)
    })
  )
}

exports.down = function(knex, Promise) {
  return knex.schema.table('users', table => {
    table.dropColumns('verified', 'verify_key')
  })
}
