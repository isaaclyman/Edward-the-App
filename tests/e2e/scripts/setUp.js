const path = require('path')

var env = require('node-env-file')
env(path.join(__dirname, '../../../.env'))
process.env.NODE_ENV = 'INTEGRATION'
