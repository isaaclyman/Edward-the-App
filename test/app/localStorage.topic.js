import { test, uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

let doc
test.beforeEach(async () => {
  await lsa.storage.clear()
  doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
})

test('get topics', async t => {
  const topics = await lsa.getAllTopics(doc.guid)
  t.is(topics.length, 0)
})

test('add topics', async t => {
  const topic1 = { archived: false, guid: uuid(), title: 'Topic 1' }
  const topic2 = { archived: false, guid: uuid(), title: 'Topic 2' }
  await lsa.updateTopic(doc.guid, topic1.guid, topic1)
  await lsa.updateTopic(doc.guid, topic2.guid, topic2)

  const topics = await lsa.getAllTopics(doc.guid)
  t.is(topics.length, 2)
  t.deepEqual(topics[0], topic1)
  t.deepEqual(topics[1], topic2)
})

test('arrange topics', async t => {
  const topic1 = { archived: false, guid: uuid(), title: 'Topic 1' }
  const topic2 = { archived: false, guid: uuid(), title: 'Topic 2' }
  await lsa.updateTopic(doc.guid, topic1.guid, topic1)
  await lsa.updateTopic(doc.guid, topic2.guid, topic2)

  await lsa.arrangeTopics(doc.guid, [topic2.guid, topic1.guid])

  const topics = await lsa.getAllTopics(doc.guid)
  t.is(topics.length, 2)
  t.deepEqual(topics[0], topic2)
  t.deepEqual(topics[1], topic1)
})

test('delete topic', async t => {
  const topic1 = { archived: false, guid: uuid(), title: 'Topic 1' }
  const topic2 = { archived: false, guid: uuid(), title: 'Topic 2' }
  await lsa.updateTopic(doc.guid, topic1.guid, topic1)
  await lsa.updateTopic(doc.guid, topic2.guid, topic2)

  await lsa.deleteTopic(doc.guid, topic1.guid)

  const topics = await lsa.getAllTopics(doc.guid)
  t.is(topics.length, 1)
  t.deepEqual(topics[0], topic2)
})

test('update topic', async t => {
  const topic1 = { archived: false, guid: uuid(), title: 'Topic 1' }
  const topic2 = { archived: false, guid: uuid(), title: 'Topic 2' }
  await lsa.updateTopic(doc.guid, topic1.guid, topic1)
  await lsa.updateTopic(doc.guid, topic2.guid, topic2)

  const newTopic = {}
  Object.assign(newTopic, topic1, { archived: true, title: 'Test1-updated' })
  await lsa.updateTopic(doc.guid, topic1.guid, newTopic)
  
  const topics = await lsa.getAllTopics(doc.guid)
  t.is(topics.length, 2)
  t.deepEqual(topics[0], newTopic)
  t.deepEqual(topics[1], topic2)
})
