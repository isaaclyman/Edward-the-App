import {
  route,
  uuid,
  wrapTest
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

export const checkChapters = (t, app, docGuid, expectFn) => {
  return wrapTest(t,
    app.get(route(`chapters/${docGuid}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const compareChapters = (t, docGuid, apiChapter, chapter) => {
  t.deepEqual({
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
  }, chapter)
}

export const updateChapter = async (app, newChapter) => {
  await (
    app.post(route('chapter/update'))
    .send(newChapter)
    .expect(200)
  )
}
