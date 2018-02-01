const LocalStorageApi = require('../../src/app/api/localStorage')
const lsa = new LocalStorageApi()
const newGuid = require('uuid/v1')

export function createTestChapter (cy, isPremium, documentGuid) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestChapter.js')
    return
  }

  const chapGuids = [newGuid(), newGuid(), newGuid()]
  const chapter = index => ({
    archived: false,
    content: null,
    guid: chapGuids[index - 1],
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

  const guid = newGuid()

  lsa.addDocument({ guid, name: 'test' })
  return guid
}

export function createTestPlan (cy, isPremium, documentGuid) {
  if (isPremium) {
    cy.exec('node cypress/scripts/createTestPlan.js')
    return
  }

  const planGuids = [newGuid(), newGuid()]
  const plan = index => ({
    archived: false,
    guid: planGuids[index - 1],
    title: `test plan ${index}`,
    sections: null
  })

  const sectionGuids = [newGuid(), newGuid(), newGuid()]
  const section = index => ({
    archived: false,
    content: null,
    guid: sectionGuids[index - 1],
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
