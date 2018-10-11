import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha
} from '../_imports'
import { addChapter, checkChapters, compareChapters, updateChapter } from './_chapter.helper'
import { addDocument } from './_document.helper'
import { addTopic } from './_topic.helper'

stubRecaptcha(test)

/*
  TESTS
*/

let app, doc
beforeEach(async () => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
})

test('get chapters', async () => {
  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(0)
  });
})

test('add chapters', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], chap1)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})

test('arrange chapters', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  await (
    app.post(route('chapter/arrange'))
    .send({
      chapterGuids: [chap2.chapterGuid, chap1.chapterGuid],
      documentGuid: doc.guid
    })
    .expect(200)
  )

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], chap2)
    compareChapters(doc.guid, chapters[1], chap1)
  });
})

test('delete chapter', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  await (
    app.post(route('chapter/delete'))
    .send({ documentGuid: doc.guid, chapterGuid: chap1.chapterGuid })
    .expect(200)
  )

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(1)
    compareChapters(doc.guid, chapters[0], chap2)
  });
})

test('update chapter', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  const newChapter = {
    documentGuid: doc.guid,
    chapterGuid: chap1.chapterGuid,
    chapter: {
      archived: false,
      content: {
        ops: [{
          insert: 'my chapter 1'
        }]
      },
      guid: chap1.chapterGuid,
      title: 'Test1-updated',
      topics: {}
    }
  }

  await updateChapter(app, newChapter)

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], newChapter)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})

test('update chapter with same content', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  chap2.chapter.archived = true
  await updateChapter(app, chap2)

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], chap1)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})

test('add chapters, then a topic', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  const topic = await addTopic(app, doc.guid, 'Topic')

  chap1.chapter.topics = {
    [topic.topicGuid]: {
      content: null,
      guid: topic.topicGuid
    }
  }

  chap2.chapter.topics = {
    [topic.topicGuid]: {
      content: null,
      guid: topic.topicGuid
    }
  }

  await updateChapter(app, chap1)
  await updateChapter(app, chap2)

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], chap1)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})

test('add a topic, then add chapters', async () => {
  const topic = await addTopic(app, doc.guid, 'Topic')
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')

  chap1.chapter.topics = {
    [topic.topicGuid]: {
      content: null,
      guid: topic.topicGuid
    }
  }

  chap2.chapter.topics = {
    [topic.topicGuid]: {
      content: null,
      guid: topic.topicGuid
    }
  }

  await updateChapter(app, chap1)
  await updateChapter(app, chap2)

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], chap1)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})

test('update chapter topic content', async () => {
  const chap1 = await addChapter(app, doc.guid, 'Test1')
  const chap2 = await addChapter(app, doc.guid, 'Test2')
  const topic1 = await addTopic(app, doc.guid, 'Topic1')
  const topic2 = await addTopic(app, doc.guid, 'Topic2')

  const newChapter = {
    documentGuid: doc.guid,
    chapterGuid: chap1.chapterGuid,
    chapter: {
      archived: chap1.chapter.archived,
      content: chap1.chapter.content,
      guid: chap1.chapterGuid,
      title: chap1.chapter.title,
      topics: {
        [topic1.topicGuid]: {
          content: {
            ops: [{
              insert: 'Topic1-content'
            }]
          },
          guid: topic1.topicGuid
        },
        [topic2.topicGuid]: {
          content: {
            ops: [{
              insert: 'Topic2-content'
            }]
          },
          guid: topic2.topicGuid
        }
      }
    }
  }

  await (
    app.post(route('chapter/update'))
    .send(newChapter)
    .expect(200)
  )

  return checkChapters(app, doc.guid, chapters => {
    expect(chapters.length).toBe(2)
    compareChapters(doc.guid, chapters[0], newChapter)
    compareChapters(doc.guid, chapters[1], chap2)
  });
})
