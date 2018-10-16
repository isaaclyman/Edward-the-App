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
import { addPlan, checkPlans, comparePlans, updatePlan } from './_plan.helper'

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

test('get plans', async () => {
  return checkPlans(app, doc.guid, plans => {
    expect(plans.length).toBe(0)
  });
})

test('add plans', async () => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  return checkPlans(app, doc.guid, plans => {
    expect(plans.length).toBe(2)
    comparePlans(doc.guid, plans[0], plan1)
    comparePlans(doc.guid, plans[1], plan2)
  });
})

test('arrange plans', async () => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  await (
    app.post(route('plan/arrange'))
    .send({
      planGuids: [plan2.planGuid, plan1.planGuid],
      documentGuid: doc.guid
    })
    .expect(200)
  )

  return checkPlans(app, doc.guid, plans => {
    expect(plans.length).toBe(2)
    comparePlans(doc.guid, plans[0], plan2)
    comparePlans(doc.guid, plans[1], plan1)
  });
})

test('delete plan', async () => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  await (
    app.post(route('plan/delete'))
    .send({ documentGuid: doc.guid, planGuid: plan1.planGuid })
    .expect(200)
  )

  return checkPlans(app, doc.guid, plans => {
    expect(plans.length).toBe(1)
    comparePlans(doc.guid, plans[0], plan2)
  });
})

test('update plan', async () => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  const newPlan = {
    documentGuid: doc.guid,
    planGuid: plan1.planGuid,
    plan: {
      archived: true,
      guid: plan1.planGuid,
      title: 'Test1-updated',
      sections: []
    }
  }

  await updatePlan(app, newPlan)

  return checkPlans(app, doc.guid, plans => {
    expect(plans.length).toBe(2)
    comparePlans(doc.guid, plans[0], newPlan)
    comparePlans(doc.guid, plans[1], plan2)
  });
})
