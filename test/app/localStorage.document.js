import { test, uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

test.beforeEach(async () => {
  await lsa.storage.clear()
})

test('get documents', async t => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const docs = await lsa.getAllDocuments()
  t.is(docs.length, 1)
})

test('add documents', async t => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  const docs = await lsa.getAllDocuments()
  t.is(docs.length, 2)
  
  t.is(docs[0].guid, doc1.guid)
  t.is(docs[0].name, doc1.name)

  t.is(docs[1].guid, doc2.guid)
  t.is(docs[1].name, doc2.name)
})

test('delete a document', async t => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  await lsa.deleteDocument(doc1.guid)

  const docs = await lsa.getAllDocuments()
  t.is(docs.length, 1)
  
  t.is(docs[0].guid, doc2.guid)
  t.is(docs[0].name, doc2.name)
})

test('delete a document that has content', async t => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const chap = { guid: uuid(), archived: false, content: null, title: 'Test Chapter', topics: {} }
  await lsa.updateChapter(doc.guid, chap.guid, chap)
  await lsa.deleteDocument(doc.guid)
  const docs = await lsa.getAllDocuments()
  t.is(docs.length, 0)
})

test('update a document (rename)', async t => {
  const doc1 = { guid: uuid(), name: 'Test Document 1' }
  const doc2 = { guid: uuid(), name: 'Test Document 2' }
  await lsa.addDocument(doc1)
  await lsa.addDocument(doc2)

  const updatedName = 'Test2-updated'

  await lsa.updateDocument({ guid: doc2.guid, name: updatedName })
  const docs = await lsa.getAllDocuments()
  t.is(docs.length, 2)

  t.is(docs[0].guid, doc1.guid)
  t.is(docs[0].name, doc1.name)

  t.is(docs[1].guid, doc2.guid)
  t.is(docs[1].name, updatedName)
})
