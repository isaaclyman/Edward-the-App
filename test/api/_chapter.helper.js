import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addChapter = async (app, docId, title) => {
  const chapterId = uuid()

  const chapter = {
    documentGuid: docId,
    chapterId: chapterId,
    chapter: {
      archived: false,
      content: null,
      id: chapterId,
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

export const checkChapters = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`chapters/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const compareChapters = (t, docId, apiChapter, chapter) => {
  t.deepEqual({
    documentGuid: docId,
    chapterId: apiChapter.guid,
    chapter: {
      archived: apiChapter.archived,
      content: apiChapter.content,
      id: apiChapter.guid,
      title: apiChapter.title,
      topics: Object.keys(apiChapter.topics).reduce((topics, id) => {
        const topic = apiChapter.topics[id]
        topics[id] = {
          content: topic.content,
          id
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
