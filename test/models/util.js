import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test
} from '../_imports'
import { addDocument } from '../api/_document.helper'
import { addChapter } from '../api/_chapter.helper'

stubRecaptcha(test)

const wait = async () => await new Promise(resolve => setTimeout(resolve, 50))

let app, doc
test.beforeEach('set up a premium user and document', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
})

test('updated timestamp is added correctly', async t => {
  let date1, date2, date3
  await addChapter(app, doc.guid, 'Test 1')
  await wait()
  date2 = Date.now()
  await wait()
  await addChapter(app, doc.guid, 'Test 3')

  return app.get(route(`chapters/${doc.guid}`))
  .expect(200)
  .expect(response => {
    const chapters = response.body
    date1 = new Date(chapters[0].updated_at).getTime()
    date3 = new Date(chapters[1].updated_at).getTime()

    t.true(date1 < date2)
    t.true(date2 < date3)
  })
})
