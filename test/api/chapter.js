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

const compareChapters = (t, docId, apiChapter, chapter) => {
  t.deepEqual({
    fileId: docId,
    chapterId: apiChapter.guid,
    chapter: {
      archived: apiChapter.archived,
      content: apiChapter.content,
      id: apiChapter.guid,
      title: apiChapter.title,
      topics: {}
    }
  }, chapter)
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
    compareChapters(t, doc.id, chapters[0], chap1)
    compareChapters(t, doc.id, chapters[1], chap2)
  })
})

test('arrange chapters', async t => {
  const chap1 = await addChapter(app, doc.id, 'Test1')
  const chap2 = await addChapter(app, doc.id, 'Test2')
  await (
    app.post(route('chapter/arrange'))
    .send({
      chapterIds: [chap2.chapterId, chap1.chapterId],
      fileId: doc.id
    })
    .expect(200)
  )

  return checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 2)
    compareChapters(t, doc.id, chapters[0], chap2)
    compareChapters(t, doc.id, chapters[1], chap1)
  })
})

test('delete chapter', async t => {
  const chap1 = await addChapter(app, doc.id, 'Test1')
  const chap2 = await addChapter(app, doc.id, 'Test2')
  await (
    app.post(route('chapter/delete'))
    .send({ fileId: doc.id, chapterId: chap1.chapterId })
    .expect(200)
  )

  return checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 1)
    compareChapters(t, doc.id, chapters[0], chap2)
  })
})

test('update chapter', async t => {
  const chap1 = await addChapter(app, doc.id, 'Test1')
  const chap2 = await addChapter(app, doc.id, 'Test2')
  const newChapter = {
    fileId: doc.id,
    chapterId: chap1.chapterId,
    chapter: {
      archived: false,
      content: {
        ops: {
          insert: 'my chapter 1'
        }
      },
      id: chap1.chapterId,
      title: 'Test1-updated',
      topics: {}
    }
  }

  await (
    app.post(route('chapter/update'))
    .send(newChapter)
    .expect(200)
  )

  return checkChapters(t, app, doc.id, chapters => {
    t.is(chapters.length, 2)
    compareChapters(t, doc.id, chapters[0], newChapter)
    compareChapters(t, doc.id, chapters[1], chap2)
  })
})
