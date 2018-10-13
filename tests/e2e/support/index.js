// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Cookies.defaults({
  whitelist: ['connect.sid']
})

Cypress.on('uncaught:exception', (err, runnable) => {
  expect(err.message).to.include('setTimeout is not defined')

  // return false to prevent the error from
  // failing this test
  return false
})
