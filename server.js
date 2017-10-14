const express = require('express')
const passport = require('passport')
const path = require('path')

const app = express()

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app.html'))
})

var session = require('express-session')

app.use(session({
  store: new (require('connect-pg-simple')(session))(),
  secret: process.env.SESSION_COOKIE_SECRET,
  resave: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}))

// Database ORM
require('./models/_index')
require('./api/_index')(app)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Express listening on port ' + port)
})

module.exports = app
