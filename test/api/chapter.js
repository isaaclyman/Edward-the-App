import {
  addDocument,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'

const route = route => `/api/${route}`

stubRecaptcha(test)

/*
  HELPER FUNCTIONS
*/

const checkChapters = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`chapters/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

/*
  TESTS
*/

let app
test.beforeEach('set up a premium user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
})

test('get chapters', t => {
  const doc = addDocument(app, 'Test1')
  checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 0)
  })
})
