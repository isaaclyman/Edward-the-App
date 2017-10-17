const path = require('path')

if (!global.hasOwnProperty('db')) {
  const Sequelize = require('sequelize')
  let sequelize = null

  // the application is executed on Heroku
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.DEBUG_DB === 'true' ? console.log : false,
    pool: { maxConnections: 10, maxIdleTime: 1000 },
    operatorsAliases: false
  })

  sequelize.authenticate().then(() => {
    console.log('Database connection established')
  }).catch((e) => {
    console.log(`Couldn't connect to database: `, e)
  })

  /*
    Models
  */

  const User = sequelize.import(path.join(__dirname, 'user'))
  const AccountType = sequelize.import(path.join(__dirname, 'accountType'))
  const Doc = sequelize.import(path.join(__dirname, 'document'))
  const Chapter = sequelize.import(path.join(__dirname, 'chapter'))
  const ChapterTopic = sequelize.import(path.join(__dirname, 'chapterTopic'))
  const MasterTopic = sequelize.import(path.join(__dirname, 'masterTopic'))

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    User,
    AccountType,
    Doc,
    Chapter,
    ChapterTopic,
    MasterTopic
  }

  /*
    Associations
  */

  User.belongsTo(AccountType)
  Doc.belongsTo(User)
  Chapter.belongsTo(Doc)
  ChapterTopic.belongsTo(Chapter)
  MasterTopic.belongsTo(Doc)
  ChapterTopic.belongsTo(MasterTopic)

  /*
    Create tables
  */
  sequelize.sync()
}

module.exports = global.db
