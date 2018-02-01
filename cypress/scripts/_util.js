const LocalStorageApi = require('../../src/app/api/localStorage')
const lsa = new LocalStorageApi()
const guid = require('uuid/v1')

export function createTestChapter (cy, isPremium, documentGuid) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestChapter.js')
    return
  }

  const chapGuids = [guid(), guid(), guid()]
  const chapter = index => ({
    archived: false,
    content: null,
    id: chapGuids[index - 1],
    title: `test chapter ${index}`,
    topics: {}
  })

  lsa.updateChapter(documentGuid, chapGuids[0], chapter(1))
  lsa.updateChapter(documentGuid, chapGuids[1], chapter(2))
  lsa.updateChapter(documentGuid, chapGuids[2], chapter(3))

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

export function createTestPlan (cy, isPremium, documentGuid) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestPlan.js')
    return
  }

  const planGuids = [guid(), guid()]
  const plan = index => ({
    archived: false,
    id: planGuids[index - 1],
    title: `test plan ${index}`,
    sections: null
  })

  const sectionGuids = [guid(), guid(), guid()]
  const section = index => ({
    archived: false,
    content: null,
    id: sectionGuids[index - 1],
    tags: [],
    title: `test section ${index}`
  })

  lsa.updatePlan(documentGuid, planGuids[0], plan(1))
  lsa.updateSection(documentGuid, planGuids[0], sectionGuids[0], section(1))

  lsa.updatePlan(documentGuid, planGuids[1], plan(2))
  lsa.updateSection(documentGuid, planGuids[1], sectionGuids[1], section(2))
  lsa.updateSection(documentGuid, planGuids[1], sectionGuids[2], section(3))

  return planGuids
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

export function setTestUserVerifyKey (cy) {
  cy.exec('node cypress/scripts/setTestUserVerifyKey.js')
}
