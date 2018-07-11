import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  test,
  uuid
} from '../_imports'
import { removeUnmatchedProperties } from '../_util'
import { addDocument } from './_document.helper'
import { checkChapters, compareChapters } from './_chapter.helper'
import { checkTopics, compareTopics } from './_topic.helper'
import { checkPlans, comparePlans } from './_plan.helper'
import { compareSections } from './_section.helper'
import { checkWorkshops, workshops } from './_workshop.helper'
import writingWorkshops from '../../models/writingWorkshop'

stubRecaptcha(test)

test('save all content', async t => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()

  const doc = await addDocument(app, 'Test1')

  const chapters = ['Introduction', 'Chapter 1'].map(title => ({
    archived: false,
    content: null,
    guid: uuid(),
    title,
    topics: {}
  }))

  const topics = ['Events', 'Scenes'].map(title => ({
    archived: false,
    guid: uuid(),
    title
  }))

  const plans = ['Synopsis', 'Plot'].map(title => ({
    archived: false,
    guid: uuid(),
    title,
    sections: [`${title}-1`, `${title}-2`].map(title => ({
      archived: false,
      content: null,
      guid: uuid(),
      tags: [],
      title
    }))
  }))

  // They share a guid because they're part of the same exercise
  const workshopGuid = uuid()
  const workshops = ['It was the best of...', 'It was the worst of...'].map((title, index) => ({
    guid: workshopGuid,
    workshopName: writingWorkshops.PLOT_WORKSHOP.name,
    content: null,
    title: title,
    order: index,
    archived: false,
    date: new Date()
  }))

  await (
    app.post(route('document/saveAll'))
    .send({
      documentGuid: doc.guid,
      chapters,
      plans,
      topics,
      workshops
    })
    .expect(200)
  )

  await checkChapters(t, app, doc.guid, apiChapters => {
    t.is(apiChapters.length, 2)
    compareChapters(t, doc.guid, apiChapters[0], {
      chapterGuid: chapters[0].guid,
      documentGuid: doc.guid,
      chapter: chapters[0]
    })
    compareChapters(t, doc.guid, apiChapters[1], {
      chapterGuid: chapters[1].guid,
      documentGuid: doc.guid,
      chapter: chapters[1]
    })
  })

  await checkTopics(t, app, doc.guid, apiTopics => {
    t.is(apiTopics.length, 2)
    compareTopics(t, doc.guid, apiTopics[0], {
      topicGuid: topics[0].guid,
      documentGuid: doc.guid,
      topic: topics[0]
    })
    compareTopics(t, doc.guid, apiTopics[1], {
      topicGuid: topics[1].guid,
      documentGuid: doc.guid,
      topic: topics[1]
    })
  })

  await checkPlans(t, app, doc.guid, apiPlans => {
    t.is(apiPlans.length, 2)

    apiPlans.forEach((apiPlan, planIndex) => {
      comparePlans(t, doc.guid, apiPlan, {
        planGuid: plans[planIndex].guid,
        documentGuid: doc.guid,
        plan: plans[planIndex]
      })
      apiPlan.sections.forEach((apiSection, sectionIndex) => {
        const section = plans[planIndex].sections[sectionIndex]
        compareSections(t, doc.guid, apiPlan.guid, apiSection, {
          sectionGuid: section.guid,
          planGuid: plans[planIndex].guid,
          documentGuid: doc.guid,
          section
        })
      })
    })
  })

  await checkWorkshops(t, app, doc.guid, apiWorkshops => {
    t.is(apiWorkshops.length, 2)


    workshops.forEach((workshop, index) => {
      removeUnmatchedProperties(workshop, apiWorkshops[index])
    })

    t.deepEqual(apiWorkshops, workshops)
  })
})
