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

import Storage from '../../src/components/api/localStorage'
import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage
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

test.afterEach('clear localStorage', async t => {
  window.localStorage.clear()
})

test('transfer an empty document from API to localStorage', async t => {
  const doc = await addDocument(app, 'Test Document')
  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getFullExport())
})

test('transfer an empty document from localStorage to API', async t => {
  const doc = { id: uuid(), name: 'Test Doc' }
  storage.addDocument(doc)
  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  await expectOneItemArray(t, app.get(route('documents')).expect(200).then(response => response.body))
  await expectOneItemArray(t, app.get(route('backup/export')).expect(200).then(response => response.body))
})

test('transfer document with content from API to localStorage', async t => {
  const doc = await addDocument(app, 'Test Document')
  await addTopic(app, doc.id, 'Test Topic')
  await addChapter(app, doc.id, 'Test Chapter')
  const plan = await addPlan(app, doc.id, 'Test Plan')
  await addSection(app, doc.id, plan.planId, 'Test Section')

  const exported = await app.get(route('backup/export')).expect(200).then(response => response.body)
  storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getAllChapters(doc.id))
  await expectOneItemArray(t, storage.getAllTopics(doc.id))
  await expectOneItemArray(t, storage.getAllPlans(doc.id), plans => {
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

test('transfer document with content from localStorage to API', async t => {
  const doc = { id: uuid(), name: 'Test Doc' }
  storage.addDocument(doc)
  const topicId = uuid()
  storage.updateTopic(doc.id, topicId, { archived: true, id: topicId, title: 'Test Topic' })
  const chapterId = uuid()
  storage.updateChapter(doc.id, chapterId, {
    archived: false,
    content: { ops: [] },
    id: chapterId,
    title: 'Test Chapter',
    topics: {
      [topicId]: {
        id: topicId,
        content: { ops: [] }
      }
    }
  })
  const planId = uuid()
  storage.updatePlan(doc.id, planId, {
    archived: true,
    id: planId,
    title: 'Test Plan',
    sections: []
  })
  const sectionId = uuid()
  storage.updateSection(doc.id, planId, sectionId, {
    archived: false,
    content: { ops: [] },
    id: sectionId,
    tags: [],
    title: 'Test Section'
  })

  const exported = await storage.getFullExport()
  await app.post(route('backup/import')).send(exported).expect(200)
  
  await expectOneItemArray(t, app.get(route('documents')).then(response => response.body))
  await expectOneItemArray(t, app.get(route(`plans/${doc.id}`)).then(response => response.body), plans => {
    const sections = plans[0].sections
    t.true(Array.isArray(sections))
    t.is(sections.length, 1)
  })
  await expectOneItemArray(t, app.get(route(`chapters/${doc.id}`)).then(response => response.body))
  await expectOneItemArray(t, app.get(route(`topics/${doc.id}`)).then(response => response.body))
  await expectOneItemArray(t, app.get(route('backup/export')).then(response => response.body), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})