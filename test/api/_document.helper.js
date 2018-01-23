import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addDocument = async (app, name) => {
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

export const addChapter = async (app, name, docId) => {
  const chapterId = uuid()
  const chapter = {
    fileId: docId,
    chapterId: chapterId,
    chapter: {
      archived: false,
      content: null,
      id: chapterId,
      title: name,
      topics: {}
    }
  }

  await (
    app.post(route('chapter/update'))
    .send(chapter)
  )

  return chapter
}

export const checkDocuments = (t, app, expectFn) => {
  return wrapTest(t,
    app.get(route('documents'))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}
