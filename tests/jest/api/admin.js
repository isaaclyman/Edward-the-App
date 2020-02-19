import {
  alternateUser,
  createAlternateTestUser,
  createTestDocument,
  createTestUser,
  deleteTestUser,
  getDocuments,
  getPersistentAgent,
  getTestUserId,
  makeTestUserAdmin,
  route,
  serverReady,
  stubRecaptcha
} from '../_imports'

stubRecaptcha(test)
import { checkDocuments } from './_document.helper'

/*
  TESTS
*/

let app
beforeEach(async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserAdmin()
})

test('get users exceeding usage limits', async () => {
  await (
    app.get(route(`admin/space-overages`))
    .expect(200)
    .expect(response => {
      const { premiums, golds } = response.body
      expect(Array.isArray(premiums)).toBeTruthy()
      expect(Array.isArray(golds)).toBeTruthy()
    })
  )
})

test('export, then import a full backup', async () => {
  await createTestDocument()
  let userId = await getTestUserId()
  let documents
  await (
    app.get(route(`admin/backup/${userId}`))
    .expect(200)
    .expect(response => {
      documents = response.body
    })
  )
  await deleteTestUser(undefined, true)
  await (
    app.post(route(`admin/backup/restore`))
    .send({ userId, documents })
    .expect(200)
  )
  await checkDocuments(app, documents => {
    expect(documents.length).toBe(2)
  })
})

test(`import a full backup without overwriting anyone else's stuff`, async () => {
  await deleteTestUser(alternateUser.email)
  const userDocGuids = await createTestDocument()
  const alternate = await createAlternateTestUser()
  const alternateDocGuids = await createTestDocument(alternateUser.email)
  let documents
  await (
    app.get(route(`admin/backup/${alternate.id}`))
    .expect(200)
    .expect(response => {
      documents = response.body
    })
  )
  await (
    app.post(route(`admin/backup/restore`))
    .send({ userId: alternate.id, documents })
  )
  await checkDocuments(app, documents => {
    expect(documents.length).toBe(2)
    expect(documents[0].guid).toBe(userDocGuids[0])
    expect(documents[1].guid).toBe(userDocGuids[1])
  })
  await getDocuments(alternate.email).then(documents => {
    expect(documents.length).toBe(2)
    expect(documents[0].guid).toBe(alternateDocGuids[0])
    expect(documents[1].guid).toBe(alternateDocGuids[1])
  })
})
