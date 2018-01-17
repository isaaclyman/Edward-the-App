const knex = require('../db')

const tableObject = (table, columns) =>
  ({ table, columns })

const tablesToCheck = [
  tableObject('documents', ['name']),
  tableObject('chapters', ['title', 'content']),
  tableObject('master_topics', ['title']),
  tableObject('chapter_topics', ['content']),
  tableObject('plans', ['title']),
  tableObject('sections', ['title', 'content'])
]

function getUsersOverLimit (accountType, limit) {
  // const spaceUsed = knex.raw(`(${
  //   tablesToCheck.map(table =>
  //     table.columns.map(col => `COALESCE(pg_column_size(${table.table}.${col}), 0)`).join(' + ')
  //   ).join(' + ')
  // })`)

  const sumCte = knex('users')
  .select(knex.raw(`
    users.id AS id, users.email AS email,
    ${
      tablesToCheck.map(table => 
        table.columns.map(col => `COALESCE(SUM(pg_column_size(${table.table}.${col})), 0) AS ${table.table}_${col}_sum`).join(', ')
      ).join(', ')
    }
  `))
  .where('users.account_type', accountType)
  .groupBy('users.id', 'users.email')

  tablesToCheck.forEach(table => {
    sumCte.leftJoin(table.table, `${table.table}.user_id`, 'users.id')
  })

  const spaceUsed = knex.raw(`(${
    tablesToCheck.map(table =>
      table.columns.map(col => `${table.table}_${col}_sum`).join(' + ')
    ).join(' + ')
  })`)

  const select = knex
    .with('sums', sumCte)
    .select({
      'id': 'id',
      'email': 'email',
      'space_used': spaceUsed
    })
    .from('sums')
    .where(spaceUsed, '>', limit)

  return select
}

module.exports = {
  getUsersOverLimit
}
