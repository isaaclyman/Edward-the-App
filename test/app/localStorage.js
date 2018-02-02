import { test, uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

test.beforeEach(async () => {
  await lsa.storage.clear()
})

test(`stores and retrieves a document`, async t => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const documents = await lsa.getAllDocuments()
  t.is(documents.length, 1)
  const returned = documents[0]
  t.is(returned.guid, doc.guid)
  t.is(returned.name, doc.name)
})
