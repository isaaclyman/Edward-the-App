import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addTopic = async (app, docId, title) => {
  const topicId = uuid()

  const topic = {
    fileId: docId,
    topicId,
    topic: {
      archived: false,
      id: topicId,
      title
    }
  }

  await (
    app.post(route('topic/update'))
    .send(topic)
    .expect(200)
  )

  return topic
}

export const checkTopics = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`topics/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const compareTopics = (t, docId, apiTopic, topic) => {
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
