import { uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

beforeEach(async () => {
  await lsa.storage.clear()
})

test('get documents', async () => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const docs = await lsa.getAllDocuments()
  expect(docs.length).toBe(1)
})

test('add documents', async () => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  const docs = await lsa.getAllDocuments()
  expect(docs.length).toBe(2)
  
  expect(docs[0].guid).toBe(doc1.guid)
  expect(docs[0].name).toBe(doc1.name)

  expect(docs[1].guid).toBe(doc2.guid)
  expect(docs[1].name).toBe(doc2.name)
})

test('delete a document', async () => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  await lsa.deleteDocument(doc1.guid)

  const docs = await lsa.getAllDocuments()
  expect(docs.length).toBe(1)
  
  expect(docs[0].guid).toBe(doc2.guid)
  expect(docs[0].name).toBe(doc2.name)
})

test('delete a document that has content', async () => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const chap = { guid: uuid(), archived: false, content: null, title: 'Test Chapter', topics: {} }
  await lsa.updateChapter(doc.guid, chap.guid, chap)
  await lsa.deleteDocument(doc.guid)
  const docs = await lsa.getAllDocuments()
  expect(docs.length).toBe(0)
})

test('update a document (rename)', async () => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  const updatedName = 'Test2-updated'

  await lsa.updateDocument({ guid: doc2.guid, name: updatedName })
  const docs = await lsa.getAllDocuments()
  expect(docs.length).toBe(2)

  expect(docs[0].guid).toBe(doc1.guid)
  expect(docs[0].name).toBe(doc1.name)

  expect(docs[1].guid).toBe(doc2.guid)
  expect(docs[1].name).toBe(updatedName)
})
