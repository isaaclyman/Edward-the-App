const LocalStorageApi = require('../../src/components/api/localStorage')
const lsa = new LocalStorageApi()
const guid = require('uuid/v1')

export function createTestChapter (cy, isPremium, fileId) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestChapter.js')
    return
  }

  const id = guid()

  lsa.updateChapter(fileId, id, {
    archived: false,
    content: {
      ops: [{
        insert: 'This is a test chapter'
      }]
    },
    id,
    title: 'test chapter 1',
    topics: {}
  })

  return id
}

export function createTestDocument (cy, isPremium) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestDocument.js')
    return
  }

  const id = guid()

  lsa.addDocument({ id, name: 'test' })
  return id
}

export function createTestUser (cy) {
  cy.exec('node cypress/scripts/createTestUser.js')
}

export function deleteTestUser (cy) {
  cy.exec('node cypress/scripts/deleteTestUser.js')
  cy.clearLocalStorage()
}

export function logIn (cy, email, password) {
  cy.request(
    'POST',
    '/api/user/login',
    { email, password, integration: true }
  )
  cy.getCookie('connect.sid').should('exist')
}

export function makeTestUserPremium (cy) {
  cy.exec('node cypress/scripts/makeTestUserPremium.js')
}
