import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha
} from '../_imports'
import { addDocument } from './_document.helper'
import writingWorkshops from '../../models/writingWorkshop'
import { workshops, addWorkshops } from './_workshop.helper'

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

test('get workshops (empty)', async () => {
  return (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      expect(Array.isArray(list)).toBeTruthy()
      expect(list.length).toBe(0)
    })
  );
})

test('add workshop content', async () => {
  await addWorkshops(app, doc.guid)
  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      expect(Array.isArray(list)).toBeTruthy()
      expect(list.length).toBe(2)
      expect(
        list.every(item => item.workshopName === writingWorkshops.PLOT_WORKSHOP.name)
      ).toBe(true)
      expect(list.every(item => item.date !== null)).toBe(true)
      const comparableList = list.map(item => {
        item.date = new Date(item.date).toDateString()
        item.createdDate = undefined
        return item
      })
      const comparableWorkshops = workshops.map(item => {
        item.createdDate = undefined
        return item
      })
      expect(comparableList[0]).toEqual(comparableWorkshops[0])
      expect(comparableList[1]).toEqual(comparableWorkshops[1])
    })
  )
})

test('update content', async () => {
  await addWorkshops(app, doc.guid)
  
  // Another time, to update the same ones
  await addWorkshops(app, doc.guid)

  await (
    app.get(route(`workshop-content/${doc.guid}`))
    .expect(200)
    .expect(response => {
      const list = response.body
      expect(Array.isArray(list)).toBeTruthy()
      expect(list.length).toBe(2)
      expect(
        list.every(item => item.workshopName === writingWorkshops.PLOT_WORKSHOP.name)
      ).toBe(true)
      expect(list.every(item => item.date !== null)).toBe(true)
      const comparableList = list.map(item => {
        item.date = new Date(item.date).toDateString()
        item.createdDate = undefined
        return item
      })
      const comparableWorkshops = workshops.map(item => {
        item.createdDate = undefined
        return item
      })
      expect(comparableList[0]).toEqual(comparableWorkshops[0])
      expect(comparableList[1]).toEqual(comparableWorkshops[1])
    })
  )
})

test('delete content', async () => {
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
      expect(Array.isArray(list)).toBeTruthy()
      expect(list.length).toBe(1)

      item = list[0]
      expect(item.workshopName === writingWorkshops.PLOT_WORKSHOP.name).toBe(true)
      expect(item.date !== null).toBe(true)

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
      expect(comparableList[0]).toEqual(comparableWorkshops[1])
    })
  )
})
