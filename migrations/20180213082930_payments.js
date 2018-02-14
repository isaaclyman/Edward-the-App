exports.up = function(knex, Promise) {
  return (
    knex.schema.table('users', table => {
      table.string('stripe_customer_id')
      table.string('stripe_subscription_id')
      table.date('payment_period_end')
    })
  )
}

exports.down = function(knex, Promise) {
  return knex.schema.table('users', table => {
    table.dropColumns('stripe_customer_id', 'stripe_subscription_id', 'payment_period_end')
  })
}
