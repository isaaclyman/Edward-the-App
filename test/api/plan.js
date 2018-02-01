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
  return checkPlans(t, app, doc.id, plans => {
    t.is(plans.length, 0)
  })
})

test('add plans', async t => {
  const plan1 = await addPlan(app, doc.id, 'Test1')
  const plan2 = await addPlan(app, doc.id, 'Test2')
  return checkPlans(t, app, doc.id, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.id, plans[0], plan1)
    comparePlans(t, doc.id, plans[1], plan2)
  })
})

test('arrange plans', async t => {
  const plan1 = await addPlan(app, doc.id, 'Test1')
  const plan2 = await addPlan(app, doc.id, 'Test2')
  await (
    app.post(route('plan/arrange'))
    .send({
      planIds: [plan2.planId, plan1.planId],
      documentGuid: doc.id
    })
    .expect(200)
  )

  return checkPlans(t, app, doc.id, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.id, plans[0], plan2)
    comparePlans(t, doc.id, plans[1], plan1)
  })
})

test('delete plan', async t => {
  const plan1 = await addPlan(app, doc.id, 'Test1')
  const plan2 = await addPlan(app, doc.id, 'Test2')
  await (
    app.post(route('plan/delete'))
    .send({ documentGuid: doc.id, planId: plan1.planId })
    .expect(200)
  )

  return checkPlans(t, app, doc.id, plans => {
    t.is(plans.length, 1)
    comparePlans(t, doc.id, plans[0], plan2)
  })
})

test('update plan', async t => {
  const plan1 = await addPlan(app, doc.id, 'Test1')
  const plan2 = await addPlan(app, doc.id, 'Test2')
  const newPlan = {
    documentGuid: doc.id,
    planId: plan1.planId,
    plan: {
      archived: true,
      id: plan1.planId,
      title: 'Test1-updated',
      sections: []
    }
  }

  await updatePlan(app, newPlan)

  return checkPlans(t, app, doc.id, plans => {
    t.is(plans.length, 2)
    comparePlans(t, doc.id, plans[0], newPlan)
    comparePlans(t, doc.id, plans[1], plan2)
  })
})
