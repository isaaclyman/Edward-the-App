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
  await addTopic(app, doc.id, 'Test Topic')
  await addChapter(app, doc.id, 'Test Chapter')
  const plan = await addPlan(app, doc.id, 'Test Plan')
  await addSection(app, doc.id, plan.planId, 'Test Section')

  await expectOneItemArray(t, app.get(route('backup/export')), response => {
    const doc = response.body[0]
    t.is(doc.chapters.length, 1)
    t.is(doc.topics.length, 1)
    t.is(doc.plans.length, 1)
    t.is(doc.plans[0].sections.length, 1)
  })
})

test('immediately import an export with content', async t => {
  await addTopic(app, doc.id, 'Test Topic')
  await addChapter(app, doc.id, 'Test Chapter')
  const plan = await addPlan(app, doc.id, 'Test Plan')
  await addSection(app, doc.id, plan.planId, 'Test Section')

  const exported = await app.get(route('backup/export')).then(response => response.body)
  await (
    app.post(route('backup/import'))
    .send(exported)
    .expect(200)
  )

  await expectOneItemArray(t, app.get(route('documents')))
  await expectOneItemArray(t, app.get(route(`plans/${doc.id}`)), response => {
    const sections = response.body[0].sections
    t.true(Array.isArray(sections))
    t.is(sections.length, 1)
  })
  await expectOneItemArray(t, app.get(route(`chapters/${doc.id}`)))
  await expectOneItemArray(t, app.get(route(`topics/${doc.id}`)))
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
    t.is(response.body[0].name, doc.name)
  })

  console.error = console_err
})
