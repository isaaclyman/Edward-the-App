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
import writingWorkshops from '../../models/writingWorkshop'
import { workshops, addWorkshops } from './_workshop.helper'

stubRecaptcha(test)

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

test('get workshops (empty)', async t => {
  return wrapTest(t,
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 0)
    })
  )
})

test('add workshop content', async t => {
  await addWorkshops(app, doc.guid)
  let contentList
  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 2)
      t.true(list.every(item => item.workshopName === writingWorkshops.PLOT_WORKSHOP.name))
      t.true(list.every(item => item.date !== null))
      const comparableList = list.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      const comparableWorkshops = workshops.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      t.deepEqual(comparableList[0], comparableWorkshops[0])
      t.deepEqual(comparableList[1], comparableWorkshops[1])
    })
  )
})

test('update content', async t => {
  await addWorkshops(app, doc.guid)
  
  // Another time, to update the same ones
  await addWorkshops(app, doc.guid)

  let contentList
  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 2)
      t.true(list.every(item => item.workshopName === writingWorkshops.PLOT_WORKSHOP.name))
      t.true(list.every(item => item.date !== null))
      const comparableList = list.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      const comparableWorkshops = workshops.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      t.deepEqual(comparableList[0], comparableWorkshops[0])
      t.deepEqual(comparableList[1], comparableWorkshops[1])
    })
  )
})

test('delete content', async t => {
  await addWorkshops(app, doc.guid)
  await (
    app.post(route(`workshop-content/delete`))
    .send({
      documentGuid: doc.guid,
      guid: workshops[0].guid
    })
    .expect(200)
  )

  let item
  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      t.truthy(Array.isArray(list))
      t.is(list.length, 1)

      item = list[0]
      t.true(item.workshopName === writingWorkshops.PLOT_WORKSHOP.name)
      t.true(item.date !== null)

      const comparableList = list.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      const comparableWorkshops = workshops.map(item => {
        item.date = new Date(item.date).toLocaleDateString()
        item.createdDate = undefined
        return item
      })
      t.deepEqual(comparableList[0], comparableWorkshops[1])
    })
  )
})
