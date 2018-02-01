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
import { addDocument } from './_document.helper'
import { addTopic, checkTopics, compareTopics } from './_topic.helper'

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
      documentGuid: doc.id,
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
      documentGuid: doc.id,
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
    documentGuid: doc.id,
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
