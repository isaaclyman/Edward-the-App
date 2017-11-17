require('./setUp')
const util = require('../../test/_util')
const sequelize = require('../../db')

util.createTestUser(sequelize).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
