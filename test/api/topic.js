import {
  addDocument,
  addTopic,
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

const checkTopics = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`topics/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

const compareTopics = (t, docId, apiTopic, topic) => {
  t.deepEqual({
    fileId: docId,
    topicId: apiTopic.guid,
    topic: {
      archived: apiTopic.archived,
      id: apiTopic.guid,
      title: apiTopic.title
    }
  }, topic)
}

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

test('get topics', async t => {
  return checkTopics(t, app, doc.id, topics => {
    t.is(topics.length, 0)
  })
})

test('add topics', async t => {
  const topic1 = await addTopic(app, doc.id, 'Test1')
  const topic2 = await addTopic(app, doc.id, 'Test2')
  return checkTopics(t, app, doc.id, topics => {
    t.is(topics.length, 2)
    compareTopics(t, doc.id, topics[0], topic1)
    compareTopics(t, doc.id, topics[1], topic2)
  })
})

test('arrange topics', async t => {
  const topic1 = await addTopic(app, doc.id, 'Test1')
  const topic2 = await addTopic(app, doc.id, 'Test2')

  await (
    app.post(route('topic/arrange'))
    .send({
      fileId: doc.id,
      topicIds: [topic2.topicId, topic1.topicId]
    })
    .expect(200)
  )

  return checkTopics(t, app, doc.id, topics => {
    t.is(topics.length, 2)
    compareTopics(t, doc.id, topics[0], topic2)
    compareTopics(t, doc.id, topics[1], topic1)
  })
})

test('delete topic', async t => {
  const topic1 = await addTopic(app, doc.id, 'Test1')
  const topic2 = await addTopic(app, doc.id, 'Test2')

  await (
    app.post(route('topic/delete'))
    .send({
      fileId: doc.id,
      topicId: topic1.topicId
    })
    .expect(200)
  )

  return checkTopics(t, app, doc.id, topics => {
    t.is(topics.length, 1)
    compareTopics(t, doc.id, topics[0], topic2)
  })
})

test('update topic', async t => {
  const topic1 = await addTopic(app, doc.id, 'Test1')
  const topic2 = await addTopic(app, doc.id, 'Test2')

  const newTopic = {
    fileId: doc.id,
    topicId: topic1.topicId,
    topic: {
      archived: true,
      id: topic1.topicId,
      title: 'Test1-updated'
    }
  }

  await (
    app.post(route('topic/update'))
    .send(newTopic)
    .expect(200)
  )

  return checkTopics(t, app, doc.id, topics => {
    t.is(topics.length, 2)
    compareTopics(t, doc.id, topics[0], newTopic)
    compareTopics(t, doc.id, topics[1], topic2)
  })
})
