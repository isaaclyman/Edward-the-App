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
import { addDocument } from './_document.helper'
import { addChapter } from './_chapter.helper'

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
  await addChapter(app, doc.guid)
})

test('Export chapters as a word document', async t => {
  wrapTest(t,
    app.post(route('word/export-chapters'))
    .send({ guid: doc.guid, title: doc.name })
    .expect(200)
    .expect(response => t.true(response.text.length > 10))
  )
})