import { uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

let doc
beforeEach(async () => {
  await lsa.storage.clear()
  doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
})


test('get plans', async () => {
  const plans = await lsa.getAllPlans(doc.guid)
  expect(plans.length).toBe(0)
})

test('add plans', async () => {
  const plan1 = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  const plan2 = { archived: false, guid: uuid(), title: 'Test Plan 2', sections: [] }
  await lsa.updatePlan(doc.guid, plan1.guid, plan1)
  await lsa.updatePlan(doc.guid, plan2.guid, plan2)

  const plans = await lsa.getAllPlans(doc.guid)
  expect(plans.length).toBe(2)
  expect(plans[0]).toEqual(plan1)
  expect(plans[1]).toEqual(plan2)
})

test('arrange plans', async () => {
  const plan1 = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  const plan2 = { archived: false, guid: uuid(), title: 'Test Plan 2', sections: [] }
  await lsa.updatePlan(doc.guid, plan1.guid, plan1)
  await lsa.updatePlan(doc.guid, plan2.guid, plan2)

  await lsa.arrangePlans(doc.guid, [plan2.guid, plan1.guid])

  const plans = await lsa.getAllPlans(doc.guid)
  expect(plans.length).toBe(2)
  expect(plans[0]).toEqual(plan2)
  expect(plans[1]).toEqual(plan1)
})

test('delete plan', async () => {
  const plan1 = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  const plan2 = { archived: false, guid: uuid(), title: 'Test Plan 2', sections: [] }
  await lsa.updatePlan(doc.guid, plan1.guid, plan1)
  await lsa.updatePlan(doc.guid, plan2.guid, plan2)

  await lsa.deletePlan(doc.guid, plan1.guid)
  
  const plans = await lsa.getAllPlans(doc.guid)
  expect(plans.length).toBe(1)
  expect(plans[0]).toEqual(plan2)
})

test('update plan', async () => {
  const plan1 = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  const plan2 = { archived: false, guid: uuid(), title: 'Test Plan 2', sections: [] }
  await lsa.updatePlan(doc.guid, plan1.guid, plan1)
  await lsa.updatePlan(doc.guid, plan2.guid, plan2)

  const newPlan = {}
  Object.assign(newPlan, plan1, { archived: true, title: 'Test1-updated' })
  await lsa.updatePlan(doc.guid, plan1.guid, newPlan)

  const plans = await lsa.getAllPlans(doc.guid)
  expect(plans.length).toBe(2)
  expect(plans[0]).toEqual(newPlan)
  expect(plans[1]).toEqual(plan2)
})
