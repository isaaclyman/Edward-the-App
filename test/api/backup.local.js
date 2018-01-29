import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  serverReady,
  stubRecaptcha,
  test,
  uuid
} from '../_imports'


import Storage from '../../src/components/api/localStorage'
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
  doc = { id: uuid(), name: 'Test Doc' }
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

  await expectOneItemArray(t, storage.getFullExport(), docs => {
    const doc = docs[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

// test('immediately import an export with content', async t => {
//   await addTopic(app, doc.id, 'Test Topic')
//   await addChapter(app, doc.id, 'Test Chapter')
//   const plan = await addPlan(app, doc.id, 'Test Plan')
//   await addSection(app, doc.id, plan.planId, 'Test Section')

//   const exported = await app.get(route('backup/export')).then(response => response.body)
//   await (
//     app.post(route('backup/import'))
//     .send(exported)
//     .expect(200)
//   )

//   await expectOneItemArray(t, app.get(route('documents')))
//   await expectOneItemArray(t, app.get(route(`plans/${doc.id}`)), response => {
//     const sections = response.body[0].sections
//     t.true(Array.isArray(sections))
//     t.is(sections.length, 1)
//   })
//   await expectOneItemArray(t, app.get(route(`chapters/${doc.id}`)))
//   await expectOneItemArray(t, app.get(route(`topics/${doc.id}`)))
//   await expectOneItemArray(t, app.get(route('backup/export')), response => {
//     const doc = response.body[0]
//     t.is(doc.chapters.length, 1)
//     t.is(doc.topics.length, 1)
//     t.is(doc.plans.length, 1)
//     t.is(doc.plans[0].sections.length, 1)
//   })
// })

// test('when the import breaks, it is reverted', async t => {
//   const console_err = console.error
//   console.error = function () {}

//   const importable = [{
//     guid: uuid(),
//     name: 'Doc 1',
//     chapters: [],
//     topics: [],
//     plans: []
//   }, {
//     guid: 'Not a guid',
//     name: {},
//     chapters: [],
//     topics: [],
//     plans: []
//   }]

//   await (
//     app.post(route('backup/import'))
//     .send(importable)
//     .expect(500)
//     .expect(response => {
//       t.true(response.text.includes('REVERTED'))
//       t.false(response.text.includes('FAIL'))
//     })
//   )

//   await expectOneItemArray(t, app.get(route('documents')))

//   await expectOneItemArray(t, app.get(route('backup/export')), response => {
//     const exported = repsonse.body[0]
//     t.is(exported.name, doc.name)
//     t.is(exported.guid, doc.guid)
//   })

//   console.error = console_err
// })
