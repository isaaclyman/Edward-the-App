import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  wrapTest
} from '../_imports'
import { addDocument } from './_document.helper'
import { addChapter } from './_chapter.helper'

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
beforeEach('set up a premium user and document', async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
  await addChapter(app, doc.guid)
})

test('Export chapters as a word document', async () => {
  wrapTest(t,
    app.post(route('word/export-chapters'))
    .send({ guid: doc.guid, title: doc.name })
    .expect(200)
    .expect(response => expect(response.text.length > 10).toBe(true))
  )
})