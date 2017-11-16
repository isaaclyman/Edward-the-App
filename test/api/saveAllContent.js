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
import { addDocument } from './_document.helper'
import { checkChapters, compareChapters } from './_chapter.helper'
import { checkTopics, compareTopics } from './_topic.helper'
import { checkPlans, comparePlans } from './_plan.helper'
import { compareSections } from './_section.helper'

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
    id: uuid(),
    title,
    topics: {}
  }))

  const topics = ['Events', 'Scenes'].map(title => ({
    archived: false,
    id: uuid(),
    title
  }))

  const plans = ['Synopsis', 'Plot'].map(title => ({
    archived: false,
    id: uuid(),
    title,
    sections: [`${title}-1`, `${title}-2`].map(title => ({
      archived: false,
      content: null,
      id: uuid(),
      tags: [],
      title
    }))
  }))

  await (
    app.post(route('document/saveAll'))
    .send({
      fileId: doc.id,
      chapters,
      plans,
      topics
    })
    .expect(200)
  )

  await checkChapters(t, app, doc.id, apiChapters => {
    t.is(apiChapters.length, 2)
    compareChapters(t, doc.id, apiChapters[0], {
      chapterId: chapters[0].id,
      fileId: doc.id,
      chapter: chapters[0]
    })
    compareChapters(t, doc.id, apiChapters[1], {
      chapterId: chapters[1].id,
      fileId: doc.id,
      chapter: chapters[1]
    })
  })

  await checkTopics(t, app, doc.id, apiTopics => {
    t.is(apiTopics.length, 2)
    compareTopics(t, doc.id, apiTopics[0], {
      topicId: topics[0].id,
      fileId: doc.id,
      topic: topics[0]
    })
    compareTopics(t, doc.id, apiTopics[1], {
      topicId: topics[1].id,
      fileId: doc.id,
      topic: topics[1]
    })
  })

  await checkPlans(t, app, doc.id, apiPlans => {
    t.is(apiPlans.length, 2)

    apiPlans.forEach((apiPlan, planIndex) => {
      comparePlans(t, doc.id, apiPlan, {
        planId: plans[planIndex].id,
        fileId: doc.id,
        plan: plans[planIndex]
      })
      apiPlan.sections.forEach((apiSection, sectionIndex) => {
        const section = plans[planIndex].sections[sectionIndex]
        compareSections(t, doc.id, apiPlan.guid, apiSection, {
          sectionId: section.id,
          planId: plans[planIndex].id,
          fileId: doc.id,
          section
        })
      })
    })
  })
})
