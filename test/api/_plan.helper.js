import {
  route,
  uuid,
  wrapTest
} from '../_imports'

export const addPlan = async (app, docGuid, title) => {
  const planGuid = uuid()

  const plan = {
    documentGuid: docGuid,
    planGuid,
    plan: {
      archived: false,
      guid: planGuid,
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

export const checkPlans = (t, app, docGuid, expectFn) => {
  return wrapTest(t,
    app.get(route(`plans/${docGuid}`))
    .expect(200)
    .expect(response => {
      t.truthy(Array.isArray(response.body))
      expectFn(response.body)
    })
  )
}

export const comparePlans = (t, docGuid, apiPlan, plan) => {
  t.deepEqual({
    documentGuid: docGuid,
    planGuid: apiPlan.guid,
    plan: {
      archived: apiPlan.archived,
      guid: apiPlan.guid,
      title: apiPlan.title,
      sections: apiPlan.sections.map(section => ({
        archived: section.archived,
        content: section.content,
        guid: section.guid,
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
