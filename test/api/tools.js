import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  wrapTest
} from '../_imports'
import { addDocument } from './_document.helper'
import writingTool from '../../models/writingTool'

stubRecaptcha(test)

/*
  TESTS
*/

const guids = ['8104b1fb-c177-4ca1-b995-a75dcbe6911c', '2ae71a48-7873-4316-bf18-d9ee0e461799']

let app, doc
test.beforeEach('set up a premium user and document', async t => {
  app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()
  doc = await addDocument(app, 'Test1')
})

const tools = [{
  guid: guids[0],
  toolName: writingTool.CHARACTER_WORKSHOP.name,
  content: { ops: [{ insert: '1' }] },
  title: 'Tool 1',
  order: 0,
  archived: false,
  date: new Date()
}, {
  guid: guids[1],
  toolName: writingTool.CHARACTER_WORKSHOP.name,
  content: { ops: [{ insert: '2' }] },
  title: 'Tool 2',
  order: 1,
  archived: false,
  date: new Date()
}]

async function addContents() {
  await (
    app.post(route(`tool-content/update`))
    .send({ documentGuid: doc.guid, tools: tools })
    .expect(200)
  )
}

test('get tools content list (empty)', async t => {
  return wrapTest(t,
    app.get(route(`tool-content/list/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 0)
    })
  )
})

test('get tools content (empty)', async t => {
  return wrapTest(t,
    app.post(route(`tool-content/by-guids`))
    .send({
      documentGuid: doc.guid,
      toolName: writingTool.FREE_WRITE.name,
      guids: guids
    })
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 0)
    })
  )
})

test('add tool content', async t => {
  await addContents()
  let contentList
  await (
    app.get(route(`tool-content/list/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 2)
      t.true(list.every(item => item.toolName === writingTool.CHARACTER_WORKSHOP.name))
      t.true(list.every(item => item.date !== null))
      contentList = list
    })
  )

  return wrapTest(t,
    app.post(route(`tool-content/by-guids`))
    .send({
      documentGuid: doc.guid,
      toolName: writingTool.CHARACTER_WORKSHOP.name,
      guids: guids
    })
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 2)
      const comparableList = list.map(item => {
        item.date = new Date(item.createdDate).toDateString()
        item.createdDate = undefined
        return item
      })
      const comparableTools = tools.map(item => {
        item.date = new Date(item.date).toDateString()
        item.createdDate = undefined
        return item
      })
      t.deepEqual(comparableList[0], comparableTools[0])
      t.deepEqual(comparableList[1], comparableTools[1])
    })
  )
})

test('delete content', async t => {
  await addContents()
  await (
    app.post(route(`tool-content/delete`))
    .send({
      documentGuid: doc.guid,
      guid: tools[0].guid
    })
    .expect(200)
  )

  let item
  await (
    app.get(route(`tool-content/list/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 1)

      item = list[0]
      t.true(item.toolName === writingTool.CHARACTER_WORKSHOP.name)
      t.true(item.date !== null)
    })
  )

  return wrapTest(t,
    app.post(route(`tool-content/by-guids`))
    .send({
      documentGuid: doc.guid,
      toolName: writingTool.CHARACTER_WORKSHOP.name,
      guids: guids
    })
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 1)
      const comparableList = list.map(item => {
        item.date = new Date(item.createdDate).toDateString()
        item.createdDate = undefined
        return item
      })
      const comparableTools = tools.map(item => {
        item.date = new Date(item.date).toDateString()
        item.createdDate = undefined
        return item
      })
      t.deepEqual(comparableList[0], comparableTools[1])
    })
  )
})
