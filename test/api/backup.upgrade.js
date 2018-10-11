import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  uuid
} from '../_imports'

import { addDocument } from './_document.helper'
import { addChapter, updateChapter } from './_chapter.helper'
import { addTopic } from './_topic.helper'
import { addPlan } from './_plan.helper'
import { addSection } from './_section.helper'
import { addWorkshops } from './_workshop.helper'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import Storage from '../../src/app/api/localStorage'
const storage = new Storage()

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

async function expectOneItemArray(promise, callback) {
  await (
    promise.then(arr => {
      expect(Array.isArray(arr)).toBe(true)
      expect(arr.length).toBe(1)
      
      if (callback) {
        callback(arr)
      }
    })
  )
}

afterEach('clear storage', async () => {
  await storage.storage.clear()
})

test('transfer an empty document from API to local storage', async () => {
  const doc = await addDocument(app, 'Test Document')
  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  await storage.doFullImport(exported)
  await expectOneItemArray(storage.getAllDocuments())
  await expectOneItemArray(storage.getFullExport())
})

test('transfer an empty document from local storage to API', async () => {
  const doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  await expectOneItemArray(app.get(route('documents')).expect(200).then(response => response.body))
  await expectOneItemArray(app.get(route('backup/export')).expect(200).then(response => response.body))
})

test('transfer document with content from API to local storage', async done => {
  const doc = await addDocument(app, 'Test Document')
  const topic = await addTopic(app, doc.guid, 'Test Topic')
  const chapter = await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  const section = await addSection(app, doc.guid, plan.planGuid, 'Test Section')
  const workshops = await addWorkshops(app, doc.guid)
  const newChapter = {
    documentGuid: doc.guid,
    chapterGuid: chapter.chapterGuid,
    chapter: {
      archived: false,
      content: { ops: [{ insert: 'test chapter 1' }] },
      guid: chapter.chapterGuid,
      title: 'test chapter',
      topics: {
        [topic.topicGuid]: {
          guid: topic.topicGuid,
          content: { ops: [{ insert: 'test chapterTopic 1' }] }
        }
      }
    }
  }
  await updateChapter(app, newChapter)

  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  await storage.doFullImport(exported)
  await expectOneItemArray(storage.getAllDocuments())
  await expectOneItemArray(storage.getAllChapters(doc.guid), chapters => {
    expect(chapters[0].content).toEqual(newChapter.chapter.content)
    expect(chapters[0].topics[topic.topicGuid].content).toEqual(newChapter.chapter.topics[topic.topicGuid].content)
  })
  await expectOneItemArray(storage.getAllTopics(doc.guid))
  await expectOneItemArray(storage.getAllPlans(doc.guid), plans => {
    const sections = plans[0].sections
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBe(1)
    expect(sections[0].content).toEqual(section.section.content)
  })

  try {
    storage.getAllWorkshops()
    done.fail()
  } catch (err) {
    // Method should fail because workshops are premium-only
  }

  await expectOneItemArray(storage.getFullExport(), docs => {
    expect(docs.length).toBe(1)
    const doc = docs[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
    expect(doc.workshops).toBeFalsy()
  })
})

test('transfer document with content from local storage to API', async () => {
  const doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
  const topicGuid = uuid()
  await storage.updateTopic(doc.guid, topicGuid, { archived: true, guid: topicGuid, title: 'Test Topic' })
  const chapterGuid = uuid()
  const chapter = {
    archived: false,
    content: { ops: [{ insert: 'test chapter 1' }] },
    guid: chapterGuid,
    title: 'Test Chapter',
    topics: {
      [topicGuid]: {
        guid: topicGuid,
        content: { ops: [{ insert: 'test chapterTopic 1' }] }
      }
    }
  }
  await storage.updateChapter(doc.guid, chapterGuid, chapter)
  const planGuid = uuid()
  await storage.updatePlan(doc.guid, planGuid, {
    archived: true,
    guid: planGuid,
    title: 'Test Plan',
    sections: []
  })
  const sectionGuid = uuid()
  const section = {
    archived: false,
    content: { ops: [{ insert: 'test section 1' }] },
    guid: sectionGuid,
    tags: [],
    title: 'Test Section'
  }
  await storage.updateSection(doc.guid, planGuid, sectionGuid, section)

  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  
  await expectOneItemArray(app.get(route('documents')).then(response => response.body))
  await expectOneItemArray(app.get(route(`plans/${doc.guid}`)).then(response => response.body), plans => {
    const sections = plans[0].sections
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBe(1)
    expect(sections[0].content).toEqual(section.content)
  })
  await expectOneItemArray(app.get(route(`chapters/${doc.guid}`)).then(response => response.body), chapters => {
    expect(chapters[0].content).toEqual(chapter.content)
    expect(chapters[0].topics[topicGuid].content).toEqual(chapter.topics[topicGuid].content)
  })
  await expectOneItemArray(app.get(route(`topics/${doc.guid}`)).then(response => response.body))
  await expectOneItemArray(app.get(route('backup/export')).then(response => response.body), docs => {
    const doc = docs[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
    expect(doc.workshops.length).toBe(0)
  })
})
