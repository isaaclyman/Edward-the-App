import {
  addDocument,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  serverReady,
  stubRecaptcha,
  test,
  uuid,
  wrapTest
} from '../_imports'

const route = route => `/api/${route}`

stubRecaptcha(test)

/*
  HELPER FUNCTIONS
*/

const checkChapters = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`chapters/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

const addChapter = async (app, docId, title) => {
  const chapterId = uuid()

  const chapter = {
    fileId: docId,
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

test('get chapters', async t => {
  return checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 0)
  })
})

test('add chapters', async t => {
  const chap1 = await addChapter(app, doc.id, 'Test1')
  const chap2 = await addChapter(app, doc.id, 'Test2')
  return checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 2)

    t.deepEqual({
      fileId: doc.id,
      chapterId: chapters[0].guid,
      chapter: {
        archived: chapters[0].archived,
        content: chapters[0].content,
        id: chapters[0].guid,
        title: chapters[0].title,
        topics: {}
      }
    }, chap1)

    t.deepEqual({
      fileId: doc.id,
      chapterId: chapters[1].guid,
      chapter: {
        archived: chapters[1].archived,
        content: chapters[1].content,
        id: chapters[1].guid,
        title: chapters[1].title,
        topics: {}
      }
    }, chap2)
  })
})
