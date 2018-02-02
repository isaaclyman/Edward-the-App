import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  serverReady,
  stubRecaptcha,
  test,
  uuid
} from '../_imports'


import Storage from '../../src/app/api/localStorage'
import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage
const storage = new Storage()

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
test.beforeEach('set up a limited user and document', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  doc = { guid: uuid(), name: 'Test Doc' }
  storage.addDocument(doc)
})

test.afterEach('clear localStorage', async t => {
  window.localStorage.clear()
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

function addContent() {
  const topicGuid = uuid()
  storage.updateTopic(doc.guid, topicGuid, { archived: true, guid: topicGuid, title: 'Test Topic' })
  const chapterGuid = uuid()
  storage.updateChapter(doc.guid, chapterGuid, {
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
  storage.updatePlan(doc.guid, planGuid, {
    archived: true,
    guid: planGuid,
    title: 'Test Plan',
    sections: []
  })
  const sectionGuid = uuid()
  storage.updateSection(doc.guid, planGuid, sectionGuid, {
    archived: false,
    content: { ops: [] },
    guid: sectionGuid,
    tags: [],
    title: 'Test Section'
  })
}

test('do a full localStorage export with no content', async t => {
  await expectOneItemArray(t, storage.getFullExport())
})

test('import a hand-made export to localStorage', async t => {
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

  window.localStorage.clear()
  storage.doFullImport(importable)

  storage.getFullExport().then(docs => {
    t.true(Array.isArray(docs))
    t.is(docs.length, 2)
    t.deepEqual(docs, importable)
  })
})

test('immediately import an export with no content to localStorage', async t => {
  const exported = await storage.getFullExport()
  window.localStorage.clear()
  storage.doFullImport(exported)
  await expectOneItemArray(t, storage.getFullExport())
})

test('do a full export with content from localStorage', async t => {
  addContent()

  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('immediately import an export with content to localStorage', async t => {
  addContent()

  const exported = await storage.getFullExport()
  storage.doFullImport(exported)

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

test('when the import to localStorage breaks, it is reverted', async t => {
  const console_err = console.error
  console.error = function () {}

  const importable = []

  storage.doFullImport(importable)

  await expectOneItemArray(t, storage.getAllDocuments())
  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const exported = docs[0]
    t.is(exported.name, doc.name)
    t.is(exported.guid, doc.guid)
  })

  console.error = console_err
})
