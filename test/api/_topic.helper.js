import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addTopic = async (app, docGuid, title) => {
  const topicGuid = uuid()

  const topic = {
    documentGuid: docGuid,
    topicGuid,
    topic: {
      archived: false,
      guid: topicGuid,
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

export const checkTopics = (t, app, docGuid, expectFn) => {
  return wrapTest(t,
    app.get(route(`topics/${docGuid}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const compareTopics = (t, docGuid, apiTopic, topic) => {
  t.deepEqual({
    documentGuid: docGuid,
    topicGuid: apiTopic.guid,
    topic: {
      archived: apiTopic.archived,
      guid: apiTopic.guid,
      title: apiTopic.title
    }
  }, topic)
}
