import { user, uuid } from '../_imports'

import 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../../src/app/api/localStorage'
const lsa = new LocalStorageApi(user.email)

beforeEach(async () => {
  await lsa.storage.clear()
})

test(`stores and retrieves a document`, async () => {
  const doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  const documents = await lsa.getAllDocuments()
  expect(documents.length).toBe(1)
  const returned = documents[0]
  expect(returned.guid).toBe(doc.guid)
  expect(returned.name).toBe(doc.name)
})
