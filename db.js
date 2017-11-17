const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.DEBUG_DB === 'true' ? console.log : false,
  pool: { maxConnections: 10, maxIdleTime: 1000 },
  operatorsAliases: false
})

module.exports = sequelize
