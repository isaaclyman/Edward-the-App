import {
  route,
  uuid
} from '../_imports'

export const addSection = async (app, docGuid, planGuid, title) => {
  const sectionGuid = uuid()

  const section = {
    documentGuid: docGuid,
    planGuid,
    sectionGuid,
    section: {
      archived: false,
      content: { ops: [{ insert: 'test section 1' }] },
      guid: sectionGuid,
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

export const compareSections = async (t, docGuid, planGuid, apiSection, section) => {
  t.deepEqual({
    documentGuid: docGuid,
    planGuid,
    sectionGuid: apiSection.guid,
    section: {
      archived: apiSection.archived,
      content: apiSection.content,
      guid: apiSection.guid,
      tags: apiSection.tags,
      title: apiSection.title
    }
  }, section)
}
