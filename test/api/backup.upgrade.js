import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  uuid,
  wrapTest
} from '../_imports'

import { addDocument } from './_document.helper'
import { addChapter } from './_chapter.helper'
import { addTopic } from './_topic.helper'
import { addPlan } from './_plan.helper'
import { addSection } from './_section.helper'

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
test.beforeEach('set up a premium user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
})

async function expectOneItemArray(t, promise, callback) {
  await (
    promise.then(arr => {
      t.true(Array.isArray(arr))
      t.is(arr.length, 1)
      
      if (callback) {
        callback(arr)
      }
    })
  )
}

test.afterEach('clear storage', async t => {
  await storage.storage.clear()
})

test('transfer an empty document from API to local storage', async t => {
  const doc = await addDocument(app, 'Test Document')
  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  await storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getFullExport())
})

test('transfer an empty document from local storage to API', async t => {
  const doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  await expectOneItemArray(t, app.get(route('documents')).expect(200).then(response => response.body))
  await expectOneItemArray(t, app.get(route('backup/export')).expect(200).then(response => response.body))
})

test('transfer document with content from API to local storage', async t => {
  const doc = await addDocument(app, 'Test Document')
  await addTopic(app, doc.guid, 'Test Topic')
  await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  await addSection(app, doc.guid, plan.planGuid, 'Test Section')

  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  await storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getAllChapters(doc.guid))
  await expectOneItemArray(t, storage.getAllTopics(doc.guid))
  await expectOneItemArray(t, storage.getAllPlans(doc.guid), plans => {
    const sections = plans[0].sections
    t.is(sections.length, 1)
  })

  await expectOneItemArray(t, storage.getFullExport(), docs => {
    t.is(docs.length, 1)
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('transfer document with content from local storage to API', async t => {
  const doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
  const topicGuid = uuid()
  await storage.updateTopic(doc.guid, topicGuid, { archived: true, guid: topicGuid, title: 'Test Topic' })
  const chapterGuid = uuid()
  await storage.updateChapter(doc.guid, chapterGuid, {
    archived: false,
    content: { ops: [] },
    guid: chapterGuid,
    title: 'Test Chapter',
    topics: {
      [topicGuid]: {
        guid: topicGuid,
        content: { ops: [] }
      }
    }
  })
  const planGuid = uuid()
  await storage.updatePlan(doc.guid, planGuid, {
    archived: true,
    guid: planGuid,
    title: 'Test Plan',
    sections: []
  })
  const sectionGuid = uuid()
  await storage.updateSection(doc.guid, planGuid, sectionGuid, {
    archived: false,
    content: { ops: [] },
    guid: sectionGuid,
    tags: [],
    title: 'Test Section'
  })

  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  
  await expectOneItemArray(t, app.get(route('documents')).then(response => response.body))
  await expectOneItemArray(t, app.get(route(`plans/${doc.guid}`)).then(response => response.body), plans => {
    const sections = plans[0].sections
    t.true(Array.isArray(sections))
    t.is(sections.length, 1)
  })
  await expectOneItemArray(t, app.get(route(`chapters/${doc.guid}`)).then(response => response.body))
  await expectOneItemArray(t, app.get(route(`topics/${doc.guid}`)).then(response => response.body))
  await expectOneItemArray(t, app.get(route('backup/export')).then(response => response.body), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})