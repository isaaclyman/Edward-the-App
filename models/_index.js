const path = require('path')

if (!global.hasOwnProperty('db')) {
  const Sequelize = require('sequelize')
  let sequelize = null

  if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: true,
      pool: { maxConnections: 10, maxIdleTime: 1000 }
    })
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize('example-app-db', 'root', null)
  }

  const User = sequelize.import(path.join(__dirname, 'user'))
  const Doc = sequelize.import(path.join(__dirname, 'document'))
  const Chapter = sequelize.import(path.join(__dirname, 'chaper'))
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
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */

  Doc.belongsTo(User)
  Chapter.belongsTo(Doc)
  ChapterTopic.belongsTo(Chapter)
  MasterTopic.belongsTo(Doc)
  ChapterTopic.belongsTo(MasterTopic)
}

module.exports = global.db
