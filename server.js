const express = require('express')
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Express listening on port ' + port)
})

module.exports = app
