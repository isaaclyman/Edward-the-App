import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha
} from '../_imports'
import { addDocument, checkDocuments } from './_document.helper'
import { addChapter } from './_chapter.helper'

stubRecaptcha(test)

/*
  TESTS
*/

let app
beforeEach(async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
})

test('get documents', async () => {
  return checkDocuments(app, docs => expect(docs.length).toBe(0))
})

test('add documents', async () => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  return checkDocuments(app, docs => {
    expect(docs.length).toBe(2)

    expect(docs[0].guid).toBe(doc1.guid)
    expect(docs[0].name).toBe(doc1.name)

    expect(docs[1].guid).toBe(doc2.guid)
    expect(docs[1].name).toBe(doc2.name)
  })
})

test('delete a document', async () => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  await (
    app.post(route('document/delete'))
    .send({ guid: doc1.guid })
    .expect(200)
  )
  return checkDocuments(app, docs => {
    expect(docs.length).toBe(1)
    expect(docs[0].guid).toBe(doc2.guid)
    expect(docs[0].name).toBe(doc2.name)
  })
})

test('delete a document that has content', async () => {
  const doc = await addDocument(app, 'Test')
  const chap = await addChapter(app, doc.guid, 'Test Chapter')
  await (
    app.post(route('document/delete'))
    .send({ guid: doc.guid })
    .expect(200)
  )
  return checkDocuments(app, docs => {
    expect(docs.length).toBe(0)
  })
})

test('update a document (rename)', async () => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  const updatedName = 'Test2-updated'
  await (
    app.post(route('document/update'))
    .send({ guid: doc2.guid, name: updatedName })
    .expect(200)
  )
  return checkDocuments(app, docs => {
    expect(docs.length).toBe(2)

    expect(docs[0].guid).toBe(doc1.guid)
    expect(docs[0].name).toBe(doc1.name)

    expect(docs[1].guid).toBe(doc2.guid)
    expect(docs[1].name).toBe(updatedName)
  })
})
