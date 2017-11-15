import {
  addDocument,
  addPlan,
  checkPlans,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  serverReady,
  stubRecaptcha,
  test
} from '../_imports'

const route = route => `/api/${route}`

stubRecaptcha(test)

/*
  HELPER FUNCTIONS
*/

const updatePlan = async (app, newPlan) => {
  await (
    app.post(route('plan/update'))
    .send(newPlan)
    .expect(200)
  )
}

const comparePlans = (t, docId, apiPlan, plan) => {
  t.deepEqual({
    fileId: docId,
    planId: apiPlan.guid,
    plan: {
      archived: apiPlan.archived,
      id: apiPlan.guid,
      title: apiPlan.title,
      sections: apiPlan.sections.map(section => ({
        archived: section.archived,
        content: section.content,
        id: section.guid,
        tags: section.tags,
        title: section.title
      }))
    }
  }, plan)
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
      fileId: doc.id
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
    .send({ fileId: doc.id, planId: plan1.planId })
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
    fileId: doc.id,
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
