import {
  route,
  uuid
} from '../_imports'

export const addSection = async (app, docId, planId, title) => {
  const sectionId = uuid()

  const section = {
    documentGuid: docId,
    planId,
    sectionId,
    section: {
      archived: false,
      content: null,
      id: sectionId,
      tags: [],
      title
    }
  }

  await (
    app.post(route('section/update'))
    .send(section)
    .expect(200)
  )

  return section
}

export const compareSections = async (t, docId, planId, apiSection, section) => {
  t.deepEqual({
    documentGuid: docId,
    planId: planId,
    sectionId: apiSection.guid,
    section: {
      archived: apiSection.archived,
      content: apiSection.content,
      id: apiSection.guid,
      tags: apiSection.tags,
      title: apiSection.title
    }
  }, section)
}
