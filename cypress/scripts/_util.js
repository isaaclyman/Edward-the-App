export function createTestChapter (cy) {
  cy.exec('node cypress/scripts/createTestChapter.js')
}

export function createTestDocument (cy) {
  cy.exec('node cypress/scripts/createTestDocument.js')
}

export function createTestUser (cy) {
  cy.exec('node cypress/scripts/createTestUser.js')
}

export function deleteTestUser (cy) {
  cy.exec('node cypress/scripts/deleteTestUser.js')
}

export function logIn (cy, email, password) {
  return (
    cy.request(
      'POST',
      '/api/user/login',
      { email, password, integration: true }
    )
  )
}

export function makeTestUserPremium (cy) {
  cy.exec('node cypress/scripts/makeTestUserPremium.js')
}
