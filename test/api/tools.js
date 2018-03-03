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
import writingTool from '../../models/writingTool'

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

test('get tools content list (empty)', async t => {
  return wrapTest(t,
    app.get(route(`tool-content/list/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 0)
    })
  )
})

test('get tools content (empty)', async t => {
  return wrapTest(t,
    app.post(route(`tool-content/by-guids`))
    .send({
      documentGuid: doc.guid,
      toolName: writingTool.FREE_WRITE.name,
      guids: ['8104b1fb-c177-4ca1-b995-a75dcbe6911c']
    })
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 0)
    })
  )
})
