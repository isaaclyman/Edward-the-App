require('./setUp')
const util = require('../../test/_util')
const sequelize = require('../../db')

util.deleteTestUser(sequelize).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})

