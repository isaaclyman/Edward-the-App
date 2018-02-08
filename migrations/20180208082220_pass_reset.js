exports.up = function(knex, Promise) {
  return (
    knex.schema.table('users', table => {
      table.string('pass_reset_key')
    })
  )
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', table => {
    table.dropColumn('pass_reset_key')
  })
};
