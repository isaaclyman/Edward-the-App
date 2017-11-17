export function createTestUser (cy) {
  cy.exec('node cypress/scripts/createTestUser.js')  
}

export function deleteTestUser (cy) {
  cy.exec('node cypress/scripts/deleteTestUser.js')  
}
