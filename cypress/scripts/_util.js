const LocalStorageApi = require('../../src/app/api/localStorage')
const lsa = new LocalStorageApi()
const newGuid = require('uuid/v1')

let seedArgs = []
function resetSeed () {
  seedArgs = []
}

function runSeed (cy, isPremium) {
  if (!seedArgs.length) {
    return
  }
  
  const seedString = seedArgs.join(' ')
  seedArgs = []
  const seedCommand = `node cypress/scripts/seedData.js ${seedString}`
  console.log(`seeding: ${seedCommand}`)
  return cy.exec(seedCommand)
}

export function seed(cy, callback, isPremium) {
  resetSeed()
  const callbackResp = callback()
  if (callbackResp && callbackResp.then) {
    return callbackResp.then(() => runSeed(cy, isPremium))
  }
  return runSeed(cy, isPremium)
}

export function createTestChapter (isPremium, documentGuid) {
  if (isPremium) {
    seedArgs.push('--chapter')
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

  return Promise.all([
    lsa.updateChapter(documentGuid, chapGuids[0], chapter(1)),
    lsa.updateChapter(documentGuid, chapGuids[1], chapter(2)),
    lsa.updateChapter(documentGuid, chapGuids[2], chapter(3))
  ])
  .then(() => lsa.arrangeChapters(documentGuid, chapGuids))
  .then(() => chapGuids)
}

export function createTestDocument (isPremium) {
  if (isPremium) {
    seedArgs.push('--document')
    return
  }

  const guid = newGuid()

  return lsa.storage.clear().then(() => lsa.addDocument({ guid, name: 'test' }).then(() => guid))
}

export function createTestOutline (isPremium, documentGuid) {
  if (isPremium) {
    seedArgs.push('--outline')
    return
  }

  const guid = newGuid()
  return lsa.updateTopic(documentGuid, guid,
    { archived: false, guid, title: 'test topic 1' }
  )
}

export function createTestPlan (isPremium, documentGuid) {
  if (isPremium) {
    seedArgs.push('--plan')
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

  return Promise.all([
    lsa.updatePlan(documentGuid, planGuids[0], plan(1)).then(() =>
      lsa.updateSection(documentGuid, planGuids[0], sectionGuids[0], section(1))  
    ),
    lsa.updatePlan(documentGuid, planGuids[1], plan(2)).then(() =>
      Promise.all([
        lsa.updateSection(documentGuid, planGuids[1], sectionGuids[1], section(2)),
        lsa.updateSection(documentGuid, planGuids[1], sectionGuids[2], section(3))
      ])
    )
  ]).then(() => planGuids)
}

export function createTestWorkshop () {
  seedArgs.push('--workshop')
}

export function createTestUser () {
  seedArgs.push('--user')
}

export function deleteTestUser () {
  seedArgs.unshift('--delete')
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

export function makeTestUserPremium () {
  seedArgs.push('--premium')
}

export function setTestUserVerifyKey () {
  seedArgs.push('--verify-key')
}

export function setTestUserResetKey () {
  seedArgs.push('--reset-key')
}
