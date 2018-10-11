import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  uuid
} from '../_imports'
import { removeUnmatchedProperties } from '../_util'
import { addDocument } from './_document.helper'
import { addChapter } from './_chapter.helper'
import { addTopic } from './_topic.helper'
import { addPlan } from './_plan.helper'
import { addSection } from './_section.helper'
import { addWorkshops } from './_workshop.helper'
import writingWorkshops from '../../models/writingWorkshop'

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

async function expectOneItemArray(supertest, callback) {
  await (
    supertest
    .expect(200)
    .expect(response => {
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(1)
      
      if (callback) {
        callback(response)
      }
    })
  )
}

// FULL EXPORT/IMPORT

test('do a full export with no content', async () => {
  await expectOneItemArray(app.get(route('backup/export')))
})

test('import a hand-made export', async () => {
  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  }, {
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  }]

  await (
    app.post(route('backup/import'))
    .send(importable)
    .expect(200)
  )

  await (
    app.get(route('backup/export'))
    .expect(200)
    .expect(response => {
      const docs = response.body
      expect(Array.isArray(docs)).toBe(true)
      expect(docs.length).toBe(2)
      expect(docs).toMatchObject(importable)
    })
  )
})

test('immediately import an export with no content', async () => {
  const exported = await app.get(route('backup/export')).then(response => response.body)
  await (
    app.post(route('backup/import'))
    .send(exported)
    .expect(200)
  )

  await expectOneItemArray(app.get(route('documents')))
  await expectOneItemArray(app.get(route('backup/export')))
})

test('do a full export with content', async () => {
  await addTopic(app, doc.guid, 'Test Topic')
  await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  await addSection(app, doc.guid, plan.planGuid, 'Test Section')
  await addWorkshops(app, doc.guid)

  await expectOneItemArray(app.get(route('backup/export')), response => {
    const doc = response.body[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
    expect(doc.workshops.length).toBe(2)
  })
})

test('immediately import an export with content', async () => {
  await addTopic(app, doc.guid, 'Test Topic')
  await addChapter(app, doc.guid, 'Test Chapter')
  const plan = await addPlan(app, doc.guid, 'Test Plan')
  await addSection(app, doc.guid, plan.planGuid, 'Test Section')
  await addWorkshops(app, doc.guid)  

  const exported = await app.get(route('backup/export')).then(response => response.body)
  await (
    app.post(route('backup/import'))
    .send(exported)
    .expect(200)
  )

  await expectOneItemArray(app.get(route('documents')))
  await expectOneItemArray(app.get(route(`plans/${doc.guid}`)), response => {
    const sections = response.body[0].sections
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBe(1)
  })
  await expectOneItemArray(app.get(route(`chapters/${doc.guid}`)))
  await expectOneItemArray(app.get(route(`topics/${doc.guid}`)))
  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(({ body: workshops }) => {
      expect(workshops.length).toBe(2)
    })
  )
  await expectOneItemArray(app.get(route('backup/export')), response => {
    const doc = response.body[0]
    expect(doc.chapters.length).toBe(1)
    expect(doc.topics.length).toBe(1)
    expect(doc.plans.length).toBe(1)
    expect(doc.plans[0].sections.length).toBe(1)
    expect(doc.workshops.length).toBe(2)
  })
})

test('when the import breaks, it is reverted', async () => {
  const console_err = console.error
  console.error = function () {}

  const importable = [{
    guid: uuid(),
    name: 'Doc 1',
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  }, {
    guid: 'Not a guid',
    name: {},
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  }]

  await (
    app.post(route('backup/import'))
    .send(importable)
    .expect(500)
    .expect(response => {
      expect(response.text.includes('REVERTED')).toBe(true)
      expect(response.text.includes('FAIL')).toBe(false)
    })
  )

  await expectOneItemArray(app.get(route('documents')))

  await expectOneItemArray(app.get(route('backup/export')), response => {
    const exported = response.body[0]
    expect(exported.name).toBe(doc.name)
    expect(exported.guid).toBe(doc.guid)
  })

  console.error = console_err
})

// SINGLE DOCUMENT

test('import a single empty document (overwrite)', async () => {
  await expectOneItemArray(app.get(route('documents')))

  const importable = {}
  Object.assign(importable, doc, {
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  })

  await (
    app.post(route('backup/import/document'))
    .send(importable)
    .expect(200)
  )

  await expectOneItemArray(app.get(route('documents')))
})

test('export a single empty document', async () => {
  await (
    app.get(route(`backup/export/document/${doc.guid}`))
    .expect(200)
    .expect(({ body: document }) => {
      expect(document).toBeTruthy()
      expect(document.guid).toBe(doc.guid)
      expect(document.name).toBe(doc.name)
      expect(document.chapters).toEqual([])
      expect(document.plans).toEqual([])
      expect(document.topics).toEqual([])
      expect(document.workshops).toEqual([])
    })
  )
})

test('import and export a single document (overwrite)', async () => {
  await (
    app.post(route('backup/import/document'))
    .send(doc)
    .expect(200)
  )

  await (
    app.get(route(`backup/export/document/${doc.guid}`))
    .expect(200)
    .expect(({ body: document }) => {
      expect(document).toBeTruthy()
      expect(document.guid).toBe(doc.guid)
      expect(document.name).toBe(doc.name)
      expect(document.chapters).toEqual([])
      expect(document.plans).toEqual([])
      expect(document.topics).toEqual([])
      expect(document.workshops).toEqual([])
    })
  )
})

test('import a single empty document (add)', async () => {
  const doc2 = {
    guid: uuid(),
    name: 'Doc 2',
    chapters: [],
    topics: [],
    plans: [],
    workshops: []
  }

  await (
    app.post(route('backup/import/document'))
    .send(doc2)
    .expect(200)
  )

  await (
    app.get(route('documents'))
    .expect(200)
    .expect(({ body: docs }) => {
      expect(Array.isArray(docs)).toBe(true)
      expect(docs.length).toBe(2)
      expect(docs[1].guid).toBe(doc2.guid)
      expect(docs[1].name).toBe(doc2.name)
    })
  )
})

test('import and export a document with content', async () => {
  const importable = {}
  const topicGuid = uuid()
  Object.assign(importable, doc, {
    chapters: [{
      archived: false,
      content: null,
      guid: uuid(),
      title: 'test chapter',
      topics: {
        [topicGuid]: {
          guid: topicGuid,
          content: null
        }
      }
    }],
    topics: [{
      archived: false,
      guid: topicGuid,
      title: 'test topic'
    }],
    plans: [{
      archived: false,
      guid: uuid(),
      title: 'test plan',
      sections: [{
        archived: false,
        guid: uuid(),
        content: null,
        title: 'test section',
        tags: []
      }]
    }],
    workshops: [{
      guid: uuid(),
      workshopName: writingWorkshops.PLOT_WORKSHOP.name,
      content: null,
      title: 'Workshop 1',
      order: 0,
      archived: false,
      date: new Date().toLocaleDateString('en-US')
    }]
  })

  await (
    app.post(route('backup/import/document'))
    .send(importable)
    .expect(200)
  )

  await (
    app.get(route(`backup/export/document/${doc.guid}`))
    .expect(200)
    .expect(({ body: document }) => {
      expect(document).toBeTruthy()
      removeUnmatchedProperties(importable, document)
      expect(document).toEqual(importable)
    })
  )
})

test('when overwrite import fails, it is reverted', async () => {
  const console_err = console.error
  console.error = function () {}

  const importable = {}
  Object.assign(importable, doc, {
    chapters: [{
      guid: 'not a guid'
    }],
    topics: [],
    plans: [],
    workshops: []
  })

  await (
    app.post(route('backup/import/document'))
    .send(importable)
    .expect(500)
    .expect(response => {
      expect(response.text.includes('REVERTED')).toBe(true)
      expect(response.text.includes('FAIL')).toBe(false)
    })
  )

  await expectOneItemArray(app.get(route('documents')).expect(({ body: documents }) => {
    expect(documents[0].guid).toBe(doc.guid)
    expect(documents[0].name).toBe(doc.name)
  }))

  console.error = console_err
})