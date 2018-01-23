import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'
import { addChapter, checkChapters, compareChapters, updateChapter } from './_chapter.helper'
import { addDocument } from './_document.helper'
import { addTopic } from './_topic.helper'

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

test('do a full export with no content', async t => {
  wrapTest(t,
    app.get(route('backup/export'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      t.is(response.body.length, 1)
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
  
  const docs = await (
    app.get(route('documents'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      t.is(response.body.length, 1)
    })
  )

  wrapTest(t,
    app.get(route('backup/export'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      t.is(response.body.length, 1)
    })
  )
})

// test('do a full export with content', async t => {

// })

// test('immediately import an export with content', async t => {

// })

// test('when the import breaks, it is reverted', async t => {

// })
