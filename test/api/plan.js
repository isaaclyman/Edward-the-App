import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test
} from '../_imports'
import { addDocument } from './_document.helper'
import { addPlan, checkPlans, comparePlans, updatePlan } from './_plan.helper'

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

test('get plans', async t => {
  return checkPlans(t, app, doc.guid, plans => {
    t.is(plans.length, 0)
  })
})

test('add plans', async t => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  return checkPlans(t, app, doc.guid, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.guid, plans[0], plan1)
    comparePlans(t, doc.guid, plans[1], plan2)
  })
})

test('arrange plans', async t => {
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

  return checkPlans(t, app, doc.guid, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.guid, plans[0], plan2)
    comparePlans(t, doc.guid, plans[1], plan1)
  })
})

test('delete plan', async t => {
  const plan1 = await addPlan(app, doc.guid, 'Test1')
  const plan2 = await addPlan(app, doc.guid, 'Test2')
  await (
    app.post(route('plan/delete'))
    .send({ documentGuid: doc.guid, planGuid: plan1.planGuid })
    .expect(200)
  )

  return checkPlans(t, app, doc.guid, plans => {
    t.is(plans.length, 1)
    comparePlans(t, doc.guid, plans[0], plan2)
  })
})

test('update plan', async t => {
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

  return checkPlans(t, app, doc.guid, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.guid, plans[0], newPlan)
    comparePlans(t, doc.guid, plans[1], plan2)
  })
})
