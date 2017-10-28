const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const passport = require('passport')
const path = require('path')
const timeout = require('connect-timeout')
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

if (!process.env.DATABASE_URL) {
  var env = require('node-env-file')
  env(path.join(__dirname, '.env'))
}

const app = express()

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SESSION_COOKIE_SECRET))
app.use(timeout(15000))

// Serve public landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Database ORM
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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

const db = require('./models/_index')(sequelize)

// Configure passport auth
require('./passport/config')(passport, db)

db.sync.then(() => {
  // Auth sessions
  const sessionStore = new SequelizeStore({
    db: sequelize
  })

  app.set('trust proxy', 1)
  app.use(session({
    store: sessionStore,
    saveUninitialized: false,
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // Set "null" for a temporary cookie (expires when browser session ends)
      secure: !process.env.INSECURE_COOKIES
    }
  }))
  sessionStore.sync()

  app.use(passport.initialize())
  app.use(passport.session())

  // REST APIs
  require('./api/_index')(app, passport)

  // Listen
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log('Express listening on port ' + port)
  })
})

module.exports = app
