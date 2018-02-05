import { test, uuid } from '../_imports'

import localStorage from 'mock-local-storage'

global.window = {}
window.localStorage = global.localStorage

import LocalStorageApi from '../../src/app/api/localStorage'
const lsa = new LocalStorageApi()

let doc, plan
test.beforeEach(async () => {
  await lsa.storage.clear()
  doc = { guid: uuid(), name: 'Test Document' }
  await lsa.addDocument(doc)
  plan = { archived: false, guid: uuid(), title: 'Test Plan 1', sections: [] }
  await lsa.updatePlan(doc.guid, plan.guid, plan)
})

test('add sections', async t => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  t.is(sections.length, 2)
  t.deepEqual(sections[0], section1)
  t.deepEqual(sections[1], section2)
})

test('arrange sections', async t => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  await lsa.arrangeSections(doc.guid, plan.guid, [section2.guid, section1.guid])

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  t.is(sections.length, 2)
  t.deepEqual(sections[0], section2)
  t.deepEqual(sections[1], section1)
})

test('update section', async t => {
  const section1 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 1' }
  const section2 = { archived: false, content: { ops: [] }, guid: uuid(), tags: [], title: 'Test section 2' }
  plan.sections = [section1, section2]
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, section1)
  await lsa.updateSection(doc.guid, plan.guid, section2.guid, section2)

  const newSection = {}
  Object.assign(newSection, section1, { archived: true, content: null, tags: ['test-tag'], title: 'Test1-updated' })
  await lsa.updateSection(doc.guid, plan.guid, section1.guid, newSection)

  const sections = await lsa._getAllSections(doc.guid, plan.guid)
  t.is(sections.length, 2)
  t.deepEqual(sections[0], newSection)
  t.deepEqual(sections[1], section2)
})
