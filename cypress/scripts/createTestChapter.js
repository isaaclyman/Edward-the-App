require('./setUp')
const util = require('../../test/_util')
const knex = require('../../db')

util.createTestChapter(knex).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
