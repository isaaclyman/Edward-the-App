const values = require('lodash/values')

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
  const Plan = sequelize.import(path.join(__dirname, 'plan'))
  const Section = sequelize.import(path.join(__dirname, 'section'))
  const Chapter = sequelize.import(path.join(__dirname, 'chapter'))
  const ChapterTopic = sequelize.import(path.join(__dirname, 'chapterTopic'))
  const MasterTopic = sequelize.import(path.join(__dirname, 'masterTopic'))

  const accountTypes = {
    LIMITED: 'limited',
    PREMIUM: 'premium',
    GOLD: 'gold',
    ADMIN: 'admin'
  }

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    User,
    AccountType,
    accountTypes,
    Doc,
    Plan,
    Section,
    Chapter,
    ChapterTopic,
    MasterTopic
  }

  /*
    Associations
  */

  User.belongsTo(AccountType)

  Doc.belongsTo(User)
  User.hasMany(Doc)

  Plan.belongsTo(Doc)
  Doc.hasMany(Plan)

  Section.belongsTo(Plan)
  Plan.hasMany(Section)

  Chapter.belongsTo(Doc)
  Doc.hasMany(Chapter)

  ChapterTopic.belongsTo(Chapter)
  Chapter.hasMany(ChapterTopic)

  MasterTopic.belongsTo(Doc)
  Doc.hasMany(MasterTopic)

  ChapterTopic.belongsTo(MasterTopic)
  MasterTopic.hasMany(ChapterTopic)

  /*
    Create tables
  */
  sequelize.sync()

  /*
    Init static data
  */
  const types = values(global.db.accountTypes)
  for (const type of types) {
    AccountType.findOrCreate({
      where: {
        name: type
      }
    }).then(([type, created]) => {
      if (created) {
        console.log(`Created account type "${type.name}".`)
      }
    })
  }
}

module.exports = global.db
