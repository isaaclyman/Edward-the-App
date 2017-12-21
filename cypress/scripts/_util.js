const LocalStorageApi = require('../../src/components/api/localStorage')
const lsa = new LocalStorageApi()
const guid = require('uuid/v1')

export function createTestChapter (cy, isPremium, fileId) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestChapter.js')
    return
  }

  const chapGuids = [guid(), guid(), guid()]
  const chapter = index => ({
    archived: false,
    content: {
      ops: [{
        insert: `test chapter ${index}`
      }]
    },
    id: chapGuids[index - 1],
    title: `test chapter ${index}`,
    topics: {}
  })

  lsa.updateChapter(fileId, chapGuids[0], chapter(1))
  lsa.updateChapter(fileId, chapGuids[1], chapter(2))
  lsa.updateChapter(fileId, chapGuids[2], chapter(3))

  return chapGuids
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
