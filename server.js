const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const expressStaticGzip = require('express-static-gzip')
const passport = require('passport')
const path = require('path')
const timeout = require('connect-timeout')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

if (!process.env.DATABASE_URL) {
  const env = require('node-env-file')
  env(path.join(__dirname, '.env'))
}

const app = express()

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'dist/')))
app.use('/', expressStaticGzip(path.join(__dirname, 'dist'), { indexFromEmptyFile: false }))
// app.use(express.static(path.join(__dirname, 'dist')))
app.use(bodyParser.json({
  // For Stripe webhooks, we compute the raw body so its signature can be verified
  verify: (req, res, buf) => {
    const url = req.originalUrl
    if (url.startsWith('/webhooks')) {
      req.rawBody = buf.toString()
    }
  },
}))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SESSION_COOKIE_SECRET))
app.use(timeout(15000))

// Serve public landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Serve legal documents
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'legal', 'privacy.html'))
})

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'legal', 'terms.html'))
})

// Serve press kit
app.get('/press', (req, res) => {
  res.sendFile(path.join(__dirname, 'press', 'press.html'))
})

// Database ORM
const knex = require('./db')
const { db, dbReady } = require('./models/_index')(knex)

const serverReady = dbReady.then(() => {
  // Configure passport auth
  require('./passport/config')(passport, knex)

  // Auth sessions
  const sessionStore = new KnexSessionStore({
    knex
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
      secure: process.env.INSECURE_COOKIES !== 'true',
    },
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  // REST APIs
  require('./api/_index')(app, passport, db)

  // Log errors
  app.use((err, req, res, next) => {
    if (err) {
      console.error(err)
    }

    next()
  })

  // Listen
  const port = process.env.PORT || 3000
  app.server = app.listen(port, () => {
    console.log(`Express listening on port ${port}`)
  })
  return sessionStore.ready
})

module.exports = { app, knex, serverReady }
