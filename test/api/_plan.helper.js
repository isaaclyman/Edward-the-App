import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addPlan = async (app, docId, title) => {
  const planId = uuid()

  const plan = {
    fileId: docId,
    planId: planId,
    plan: {
      archived: false,
      id: planId,
      title,
      sections: []
    }
  }

  await (
    app.post(route('plan/update'))
    .send(plan)
    .expect(200)
  )

  return plan
}

export const checkPlans = (t, app, docId, expectFn) => {
  return wrapTest(t,
    app.get(route(`plans/${docId}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const comparePlans = (t, docId, apiPlan, plan) => {
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

export const updatePlan = async (app, newPlan) => {
  await (
    app.post(route('plan/update'))
    .send(newPlan)
    .expect(200)
  )
}
