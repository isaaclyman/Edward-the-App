const pg = require('pg');

pg.defaults.ssl = false

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'edwardtheapp',
  },
}
