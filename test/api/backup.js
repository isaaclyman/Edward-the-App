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

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
test.beforeEach('set up a premium user and document', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
})

async function expectOneItemArray(t, supertest, callback) {
  await (
    supertest
    .expect(200)
    .expect(response => {
      t.true(Array.isArray(response.body))
      t.is(response.body.length, 1)
      
      if (callback) {
        callback(response)
      }
    })
  )
}

test('do a full export with no content', async t => {
  await expectOneItemArray(t, app.get(route('backup/export')))
})

test('import a hand-made export', async t => {
  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: []
  }, {
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: []
  }]

  await (
    app.post(route('backup/import'))
    .send(importable)
    .expect(200)
  )

  wrapTest(t,
    app.get(route('backup/export'))
    .expect(200)
    .expect(response => {
      const docs = response.body
      t.true(Array.isArray(docs))
      t.is(docs.length, 2)
      t.deepEqual(docs, importable)
    })
  )
})

test('immediately import an export with no content', async t => {
  const exported = await app.get(route('backup/export')).then(response => response.body)
  await (
    app.post(route('backup/import'))
    .send(exported)
    .expect(200)
  )

  await expectOneItemArray(t, app.get(route('documents')))
  await expectOneItemArray(t, app.get(route('backup/export')))
})

test('do a full export with content', async t => {
  await addTopic(app, doc.guid, 'Test Topic')
  await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  await addSection(app, doc.guid, plan.planGuid, 'Test Section')

  await expectOneItemArray(t, app.get(route('backup/export')), response => {
    const doc = response.body[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('immediately import an export with content', async t => {
  await addTopic(app, doc.guid, 'Test Topic')
  await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  await addSection(app, doc.guid, plan.planGuid, 'Test Section')

  const exported = await app.get(route('backup/export')).then(response => response.body)
  await (
    app.post(route('backup/import'))
    .send(exported)
    .expect(200)
  )

  await expectOneItemArray(t, app.get(route('documents')))
  await expectOneItemArray(t, app.get(route(`plans/${doc.guid}`)), response => {
    const sections = response.body[0].sections
    t.true(Array.isArray(sections))
    t.is(sections.length, 1)
  })
  await expectOneItemArray(t, app.get(route(`chapters/${doc.guid}`)))
  await expectOneItemArray(t, app.get(route(`topics/${doc.guid}`)))
  await expectOneItemArray(t, app.get(route('backup/export')), response => {
    const doc = response.body[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('when the import breaks, it is reverted', async t => {
  const console_err = console.error
  console.error = function () {}

  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: []
  }, {
    guid: 'Not a guid',
    name: {},
    chapters: [],
    topics: [],
    plans: []
  }]

  await (
    app.post(route('backup/import'))
    .send(importable)
    .expect(500)
    .expect(response => {
      t.true(response.text.includes('REVERTED'))
      t.false(response.text.includes('FAIL'))
    })
  )

  await expectOneItemArray(t, app.get(route('documents')))

  await expectOneItemArray(t, app.get(route('backup/export')), response => {
    const exported = response.body[0]
    t.is(exported.name, doc.name)
    t.is(exported.guid, doc.guid)
  })

  console.error = console_err
})

test('import a single empty document (overwrite)', async t => {
  const importable = {}
  Object.assign(importable, doc, {
    chapters: [],
    topics: [],
    plans: []
  })

  await (
    app.post(route('backup/import/document'))
    .send(importable)
    .expect(200)
  )

  await expectOneItemArray(t, app.get(route('documents')))
})

test('export a single empty document', async t => {
  await (
    app.get(route(`backup/export/document/${doc.guid}`))
    .expect(200)
    .expect(({ body: document }) => {
      t.truthy(document)
      t.is(document.guid, doc.guid)
      t.is(document.name, doc.name)
      t.deepEqual(document.chapters, [])
      t.deepEqual(document.plans, [])
      t.deepEqual(document.topics, [])
    })
  )
})

test('import and export a single document (overwrite)', async t => {
  await (
    app.post(route('backup/import/document'))
    .send(doc)
    .expect(200)
  )

  await (
    app.get(route(`backup/export/document/${doc.guid}`))
    .expect(200)
    .expect(({ body: document }) => {
      t.truthy(document)
      t.is(document.guid, doc.guid)
      t.is(document.name, doc.name)
      t.deepEqual(document.chapters, [])
      t.deepEqual(document.plans, [])
      t.deepEqual(document.topics, [])
    })
  )
})

test('import a single empty document (add)', async t => {
  const doc2 = {
    guid: uuid(),
    name: 'Doc 2',
    chapters: [],
    topics: [],
    plans: []
  }

  await (
    app.post(route('backup/import/document'))
    .send(doc2)
    .expect(200)
  )

  await (
    app.get(route('documents'))
    .expect(200)
    .expect(({ body: docs }) => {
      t.true(Array.isArray(docs))
      t.is(docs.length, 2)
      t.is(docs[1].guid, doc2.guid)
      t.is(docs[1].name, doc2.name)
    })
  )
})