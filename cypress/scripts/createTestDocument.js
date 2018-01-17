require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')

util.createTestDocument(knex).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
