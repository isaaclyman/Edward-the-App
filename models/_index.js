const path = require('path')

if (!global.hasOwnProperty('db')) {
  const Sequelize = require('sequelize')
  let sequelize = null

  if (process.env.DATABASE_URL) {
    // the application is executed on Heroku
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: (e) => console.error(e),
      pool: { maxConnections: 10, maxIdleTime: 1000 }
    })
  } else {
    // the application is executed on the local machine
    sequelize = new Sequelize('postgres', 'isaac', 'postgreslocal', {
      dialect: 'postgres',
      protocol: 'postgres',
      host: 'localhost',
      port: 5432,
      logging: (e) => console.error(e),
      pool: { maxConnections: 5, maxIdleTime: 200 }
    })
  }

  sequelize.authenticate().then(() => {
    console.log('Database connection established')
  }).catch((e) => {
    console.log(`Couldn't connect to database: `, e)
  })

  const User = sequelize.import(path.join(__dirname, 'user'))
  const Doc = sequelize.import(path.join(__dirname, 'document'))
  const Chapter = sequelize.import(path.join(__dirname, 'chapter'))
  const ChapterTopic = sequelize.import(path.join(__dirname, 'chapterTopic'))
  const MasterTopic = sequelize.import(path.join(__dirname, 'masterTopic'))

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    User,
    Doc,
    Chapter,
    ChapterTopic,
    MasterTopic
  }

  /*
    Associations
  */

  Doc.belongsTo(User)
  Chapter.belongsTo(Doc)
  ChapterTopic.belongsTo(Chapter)
  MasterTopic.belongsTo(Doc)
  ChapterTopic.belongsTo(MasterTopic)
}

module.exports = global.db
