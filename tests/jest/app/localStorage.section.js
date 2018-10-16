import { uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

let doc, plan
beforeEach(async () => {
  await lsa.storage.clear()
  doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  plan = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  await lsa.updatePlan(doc.guid, plan.guid, plan)
})

test('add sections', async () => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  expect(sections.length).toBe(2)
  expect(sections[0]).toEqual(section1)
  expect(sections[1]).toEqual(section2)
})

test('arrange sections', async () => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  await lsa.arrangeSections(doc.guid, plan.guid, [section2.guid, section1.guid])

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  expect(sections.length).toBe(2)
  expect(sections[0]).toEqual(section2)
  expect(sections[1]).toEqual(section1)
})

test('update section', async () => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  const newSection = {}
  Object.assign(newSection, section1, { archived: true, content: null, tags: ['test-tag'], title: 'Test1-updated' })
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, newSection)

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  expect(sections.length).toBe(2)
  expect(sections[0]).toEqual(newSection)
  expect(sections[1]).toEqual(section2)
})
