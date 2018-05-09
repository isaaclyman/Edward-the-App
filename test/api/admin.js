import {
  alternateUser,
  createAlternateTestUser,
  createTestDocument,
  createTestChapter,
  createTestUser,
  deleteTestUser,
  getDocuments,
  getPersistentAgent,
  getTestUserId,
  makeTestUserAdmin,
  route,
  serverReady,
  stubRecaptcha,
  test,
  user,
  wrapTest
} from '../_imports'

stubRecaptcha(test)
import { checkDocuments } from './_document.helper'

/*
  TESTS
*/

let app
test.beforeEach('set up an admin user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserAdmin()
})

test('get users exceeding usage limits', async t => {
  return wrapTest(t,
    app.get(route(`admin/space-overages`))
    .expect(200)
    .expect(response => {
      const { premiums, golds } = response.body
      t.truthy(Array.isArray(premiums))
      t.truthy(Array.isArray(golds))
    })
  )
})

test('export, then import a full backup', async t => {
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
  await checkDocuments(t, app, documents => {
    t.is(documents.length, 2)
  })
})

test(`import a full backup without overwriting anyone else's stuff`, async t => {
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
  await checkDocuments(t, app, documents => {
    t.is(documents.length, 2)
    t.is(documents[0].guid, userDocGuids[0])
    t.is(documents[1].guid, userDocGuids[1])
  })
  await getDocuments(alternate.email).then(documents => {
    t.is(documents.length, 2)
    t.is(documents[0].guid, alternateDocGuids[0])
    t.is(documents[1].guid, alternateDocGuids[1])
  })
})
