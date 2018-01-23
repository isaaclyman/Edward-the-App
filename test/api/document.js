import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'
import { addDocument, addChapter, checkDocuments } from './_document.helper'

stubRecaptcha(test)

/*
  TESTS
*/

let app
test.beforeEach('set up a premium user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
})

test('get documents', async t => {
  return checkDocuments(t, app, docs => t.is(docs.length, 0))
})

test('add documents', async t => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  return checkDocuments(t, app, docs => {
    t.is(docs.length, 2)

    t.is(docs[0].guid, doc1.id)
    t.is(docs[0].name, doc1.name)

    t.is(docs[1].guid, doc2.id)
    t.is(docs[1].name, doc2.name)
  })
})

test('delete a document', async t => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  await (
    app.post(route('document/delete'))
    .send({ id: doc1.id })
    .expect(200)
  )
  return checkDocuments(t, app, docs => {
    t.is(docs.length, 1)
    t.is(docs[0].guid, doc2.id)
    t.is(docs[0].name, doc2.name)
  })
})

test('delete a document that has content', async t => {
  const doc = await addDocument(app, 'Test')
  const chap = await addChapter(app, 'Test Chapter', doc.id)
  await (
    app.post(route('document/delete'))
    .send({ id: doc.id })
    .expect(200)
  )
  return checkDocuments(t, app, docs => {
    t.is(docs.length, 0)
  })
})

test('update a document (rename)', async t => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  const updatedName = 'Test2-updated'
  await wrapTest(t,
    app.post(route('document/update'))
    .send({ id: doc2.id, name: updatedName })
    .expect(200)
  )
  return checkDocuments(t, app, docs => {
    t.is(docs.length, 2)

    t.is(docs[0].guid, doc1.id)
    t.is(docs[0].name, doc1.name)

    t.is(docs[1].guid, doc2.id)
    t.is(docs[1].name, updatedName)
  })
})
