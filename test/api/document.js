import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'
import uuid from 'uuid/v1'

const route = route => `/api/${route}`

stubRecaptcha(test)

const checkDocuments = (t, app, expectFn) => {
  return wrapTest(t,
    app.get(route('documents'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

const addDocument = async (app, name) => {
  const document = {
    id: uuid(),
    name
  }

  await (
    app.post(route('document/add'))
    .send(document)
  )

  return document
}

let app
test.beforeEach('set up a premium user', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
})

test('get documents', async t => {
  return checkDocuments(t, app, docs => t.is(docs.length, 0))
})

test('add documents', async t => {
  const doc1 = await addDocument(app, 'Test1')
  const doc2 = await addDocument(app, 'Test2')
  return checkDocuments(t, app, docs => {
    t.is(docs.length, 2)

    t.is(docs[0].guid, doc1.id)
    t.is(docs[0].name, doc1.name)

    t.is(docs[1].guid, doc2.id)
    t.is(docs[1].name, doc2.name)
  })
})
