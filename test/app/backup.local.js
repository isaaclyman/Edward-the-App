import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  serverReady,
  stubRecaptcha,
  test,
  uuid
} from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import Storage from '../../src/app/api/localStorage'
const storage = new Storage()

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
test.beforeEach('set up a limited user and document', async t => {
  await storage.storage.clear()
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  doc = { guid: uuid(), name: 'Test Doc' }
  await storage.addDocument(doc)
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

async function addContent() {
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
}

test('do a full local storage export with no content', async t => {
  await expectOneItemArray(t, storage.getFullExport())
})

test('import a hand-made export to local storage', async t => {
  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: []
  }, {
    guid: uuid(),
    name: 'Doc 2',
    chapters: [],
    topics: [],
    plans: []
  }]

  await storage.storage.clear()
  await storage.doFullImport(importable)

  storage.getFullExport().then(docs => {
    t.true(Array.isArray(docs))
    t.is(docs.length, 2)
    t.deepEqual(docs, importable)
  })
})

test('immediately import an export with no content to local storage', async t => {
  const exported = await storage.getFullExport()
  await storage.storage.clear()
  await storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getFullExport())
})

test('do a full export with content from local storage', async t => {
  await addContent()

  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('immediately import an export with content to local storage', async t => {
  await addContent()
  
  const exported = await storage.getFullExport()
  await storage.doFullImport(exported)

  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getAllPlans(doc.guid), plans => {
    const sections = plans[0].sections
    t.true(Array.isArray(sections))
    t.is(sections.length, 1)
  })
  await expectOneItemArray(t, storage.getAllChapters(doc.guid))
  await expectOneItemArray(t, storage.getAllTopics(doc.guid))

  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('when the import to local storage breaks, it is reverted', async t => {
  const console_err = console.error
  console.error = function () {}

  const importable = []

  await storage.doFullImport(importable)

  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const exported = docs[0]
    t.is(exported.name, doc.name)
    t.is(exported.guid, doc.guid)
  })

  console.error = console_err
})
