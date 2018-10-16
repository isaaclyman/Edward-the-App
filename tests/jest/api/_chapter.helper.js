import {
  route,
  uuid
} from '../_imports'

export const addChapter = async (app, docGuid, title) => {
  const chapterGuid = uuid()

  const chapter = {
    documentGuid: docGuid,
    chapterGuid: chapterGuid,
    chapter: {
      archived: false,
      content: null,
      guid: chapterGuid,
      title,
      topics: {}
    }
  }

  await (
    app.post(route('chapter/update'))
    .send(chapter)
    .expect(200)
  )

  return chapter
}

export const checkChapters = (app, docGuid, expectFn) => {
  return (
    app.get(route(`chapters/${docGuid}`))
    .expect(200)
    .expect(response => {
      expect(Array.isArray(response.body)).toBeTruthy()
      expectFn(response.body)
    })
  )
}

export const compareChapters = (docGuid, apiChapter, chapter) => {
  expect({
    documentGuid: docGuid,
    chapterGuid: apiChapter.guid,
    chapter: {
      archived: apiChapter.archived,
      content: apiChapter.content,
      guid: apiChapter.guid,
      title: apiChapter.title,
      topics: Object.keys(apiChapter.topics).reduce((topics, guid) => {
        const topic = apiChapter.topics[guid]
        topics[guid] = {
          content: topic.content,
          guid
        }

        return topics
      }, {})
    }
  }).toMatchObject(chapter)
}

export const updateChapter = async (app, newChapter) => {
  await (
    app.post(route('chapter/update'))
    .send(newChapter)
    .expect(200)
  )
}
