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
  const query = knex('users')

  tablesToCheck.forEach(table => {
    table.columns.forEach(col => {
      query.with(`${table.table}_${col}_sum`, 
        knex('users')
        .select({
          'id': 'users.id',
          'space_used': knex.raw(`COALESCE(SUM(pg_column_size(${table.table}.${col})), 0)`)
        })
        .where('users.account_type', accountType)
        .leftJoin(table.table, `${table.table}.user_id`, 'users.id')
        .groupBy('users.id')
      )
    })
  })

  const sumCte = knex('users').select({
    'id': 'users.id',
    'email': 'users.email',
    'space_used': knex.raw(`(
      ${tablesToCheck.map(table =>
        table.columns.map(col => `${table.table}_${col}_sum.space_used`).join(' + ')
      ).join(' + ')}
    )`)
  })

  tablesToCheck.forEach(table => {
    table.columns.forEach(col => {
      const cte = `${table.table}_${col}_sum`
      sumCte.innerJoin(cte, `${cte}.id`, 'users.id')
    })
  })

  query.with('sums', sumCte)
  query.select('id', 'email', 'space_used')
    .from('sums')
    .where('space_used', '>', limit)

  return query
}

module.exports = {
  getUsersOverLimit
}
