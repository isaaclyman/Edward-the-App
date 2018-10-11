import {
  route,
  uuid
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

export const checkTopics = (app, docGuid, expectFn) => {
  return (
    app.get(route(`topics/${docGuid}`))
    .expect(200)
    .expect(response => {
      expect(Array.isArray(response.body)).toBeTruthy()
      expectFn(response.body)
    })
  )
}

export const compareTopics = (docGuid, apiTopic, topic) => {
  expect({
    documentGuid: docGuid,
    topicGuid: apiTopic.guid,
    topic: {
      archived: apiTopic.archived,
      guid: apiTopic.guid,
      title: apiTopic.title
    }
  }).toMatchObject(topic)
}
