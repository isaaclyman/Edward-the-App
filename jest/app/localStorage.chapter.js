import { uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

let doc
beforeEach(async () => {
  await lsa.storage.clear()
  doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
})

test('get chapters', async () => {
  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(0)
})

test('add chapters', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(chap1)
  expect(chapters[1]).toEqual(chap2)
})

test('arrange chapters', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  await lsa.arrangeChapters(doc.guid, [chap2.guid, chap1.guid])
  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(chap2)
  expect(chapters[1]).toEqual(chap1)
})

test('delete chapter', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  await lsa.deleteChapter(doc.guid, chap1.guid)
  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(1)
  expect(chapters[0]).toEqual(chap2)
})

test('update chapter', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)
  
  const newContent = { ops: [{ insert: 'my chapter 1' }] }
  const newChapter = { guid: chap1.guid, archived: false, content: newContent, title: 'Test1-updated', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, newChapter)

  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(newChapter)
  expect(chapters[1]).toEqual(chap2)
})

test('update chapter with same content', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  chap2.archived = true
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(chap1)
  expect(chapters[1]).toEqual(chap2)
})

test('add chapters, then a topic', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)
  
  const topic = { guid: uuid(), archived: false, title: 'Test Topic' }
  await lsa.updateTopic(doc.guid, topic.guid, topic)

  chap1.topics[topic.guid] = { content: null, guid: topic.guid }
  chap2.topics[topic.guid] = { content: null, guid: topic.guid }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(chap1)
  expect(chapters[1]).toEqual(chap2)
})

test('add a topic, then add chapters', async () => {
  const topic = { guid: uuid(), archived: false, title: 'Test Topic' }
  await lsa.updateTopic(doc.guid, topic.guid, topic)

  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  chap1.topics[topic.guid] = { content: null, guid: topic.guid }
  chap2.topics[topic.guid] = { content: null, guid: topic.guid }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(chap1)
  expect(chapters[1]).toEqual(chap2)
})

test('update chapter topic content', async () => {
  const chap1 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 1', topics: {} }
  const chap2 = { guid: uuid(), archived: false, content: null, title: 'Test Chapter 2', topics: {} }
  await lsa.updateChapter(doc.guid, chap1.guid, chap1)
  await lsa.updateChapter(doc.guid, chap2.guid, chap2)

  const topic1 = { guid: uuid(), archived: false, title: 'Test Topic 1' }
  const topic2 = { guid: uuid(), archived: false, title: 'Test Topic 2' }
  await lsa.updateTopic(doc.guid, topic1.guid, topic1)
  await lsa.updateTopic(doc.guid, topic2.guid, topic2)

  const newChapter = {}
  Object.assign(newChapter, chap1, {
    topics: {
      [topic1.guid]: {
        content: {
          ops: [{
            insert: 'Topic1-content'
          }]
        },
        guid: topic1.guid
      },
      [topic2.guid]: {
        content: {
          ops: [{
            insert: 'Topic2-content'
          }]
        },
        guid: topic2.guid
      }
    }
  })

  await lsa.updateChapter(doc.guid, chap1.guid, newChapter)
  const chapters = await lsa.getAllChapters(doc.guid)
  expect(chapters.length).toBe(2)
  expect(chapters[0]).toEqual(newChapter)
  expect(chapters[1]).toEqual(chap2)
})
