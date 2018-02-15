import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserAdmin,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'

stubRecaptcha(test)

/*
  TESTS
*/

let app
test.beforeEach('set up an admin user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserAdmin()
})

test('get users exceeding usage limits', async t => {
  return wrapTest(t,
    app.get(route(`admin/space-overages`))
    .expect(200)
    .expect(response => {
      const { premiums, golds } = response.body
      t.truthy(Array.isArray(premiums))
      t.truthy(Array.isArray(golds))
    })
  )
})
