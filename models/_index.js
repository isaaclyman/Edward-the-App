const values = require('lodash/values')
const path = require('path')

module.exports = function (sequelize) {
  /*
    Models
  */

  const User = sequelize.import(path.join(__dirname, 'user'))
  const Order = sequelize.import(path.join(__dirname, 'order'))
  const AccountType = sequelize.import(path.join(__dirname, 'accountType'))
  const Doc = sequelize.import(path.join(__dirname, 'document'))
  const Plan = sequelize.import(path.join(__dirname, 'plan'))
  const Section = sequelize.import(path.join(__dirname, 'section'))
  const Chapter = sequelize.import(path.join(__dirname, 'chapter'))
  const ChapterTopic = sequelize.import(path.join(__dirname, 'chapterTopic'))
  const MasterTopic = sequelize.import(path.join(__dirname, 'masterTopic'))

  const createAccountType = (name, displayName, description) => ({ name, displayName, description })
  const limitedMessage = `All data is stored on your computer's hard drive and may be lost if your browsing data is cleared.
  Most computers have a maximum storage limit of 10MB (about 5,000 pages).`

  const accountTypes = {
    DEMO: createAccountType('DEMO', 'Demo Account', limitedMessage),
    LIMITED: createAccountType('LIMITED', 'Limited Account', limitedMessage),
    PREMIUM: createAccountType('PREMIUM', 'Premium Account',
      `Your data is stored on our servers. Your storage limit is 20MB (about 10,000 pages).`),
    GOLD: createAccountType('GOLD', 'Gold Account',
      `Your data is stored on our servers. Your storage limit is 250MB (about 125,000 pages).`),
    ADMIN: createAccountType('ADMIN', 'Admin Account', `You know who you are.`)
  }

  const db = {
    sequelize: sequelize,
    User,
    Order,
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

  Order.belongsTo(User)
  User.hasMany(Order)

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
  db.sync = sequelize.sync().then(() => {
      /*
        Init static data
      */
    const types = values(db.accountTypes)
    const accountTypePromises = []
    for (const type of types) {
      const promise = AccountType.findCreateFind({
        where: {
          name: type.name
        }
      })
      accountTypePromises.push(promise)
      promise.then(([type, created]) => {
        if (created) {
          console.log(`Created account type "${type.name}".`)
        }
      })
    }

    Promise.all(accountTypePromises).then(() => {
      AccountType.findOne({
        where: { name: accountTypes.DEMO.name }
      }).then(({ id: demoId }) => {
        User.findCreateFind({
          where: {
            email: 'demo@edwardtheapp.com'
          },
          include: [{
            model: AccountType,
            where: {
              'name': accountTypes.DEMO.name
            }
          }],
          defaults: {
            accountTypeId: demoId,
            email: 'demo@edwardtheapp.com',
            password: 'DEMO'
          }
        }).then(([user, created]) => {
          if (created) {
            console.log(`Created demo user.`)
          }

          db.DemoUser = user
        })
      })
    })
  })

  return db
}
