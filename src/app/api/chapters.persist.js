import debounce from 'lodash/debounce'
import { ADD_CHAPTER, ADD_PLAN, ADD_SECTION, ADD_TOPIC, ADD_TOPIC_TO_CHAPTER,
  ARCHIVE_CHAPTER, ARCHIVE_PLAN, ARCHIVE_SECTION, ARCHIVE_TOPIC,
  DELETE_CHAPTER, DELETE_PLAN, DELETE_SECTION, DELETE_TOPIC,
  REARRANGE_CHAPTERS, REARRANGE_PLANS, REARRANGE_SECTIONS, REARRANGE_TOPICS,
  RESTORE_CHAPTER, RESTORE_PLAN, RESTORE_SECTION, RESTORE_TOPIC,
  UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT, UPDATE_PLAN,
  UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS,
  UPDATE_TOPIC, UPDATE_TOPIC_CONTENT } from '../shared/chapters.store'

import { ADD_DOCUMENT, REMOVE_OWNED_DOCUMENT, UPDATE_DOCUMENT_NAME } from '../shared/document.store'

import { ADD_WORKSHOP, ARCHIVE_WORKSHOP, DELETE_WORKSHOP, RESTORE_WORKSHOP,
  UPDATE_WORKSHOPS_CONTENT } from '../shared/workshops.store'

import { getStorageApi } from './storageSwitch'

const mutations = {
  addDocument: [ADD_DOCUMENT],
  deleteChapter: [DELETE_CHAPTER],
  deleteDocument: [REMOVE_OWNED_DOCUMENT],
  deletePlan: [DELETE_PLAN],
  deleteSection: [DELETE_SECTION],
  deleteTopic: [DELETE_TOPIC],
  deleteWorkshop: [DELETE_WORKSHOP],
  rearrangeChapter: [REARRANGE_CHAPTERS],
  rearrangePlan: [REARRANGE_PLANS],
  rearrangeSection: [REARRANGE_SECTIONS],
  rearrangeTopic: [REARRANGE_TOPICS],
  updateChapter: [ADD_CHAPTER, ADD_TOPIC_TO_CHAPTER, ARCHIVE_CHAPTER,
    RESTORE_CHAPTER, UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT,
    UPDATE_TOPIC_CONTENT],
  updateDocument: [UPDATE_DOCUMENT_NAME],
  updatePlan: [ADD_PLAN, ARCHIVE_PLAN, RESTORE_PLAN, UPDATE_PLAN],
  updateSection: [ADD_SECTION, ARCHIVE_SECTION, RESTORE_SECTION,
    UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS],
  updateTopic: [ADD_TOPIC, ARCHIVE_TOPIC,
    RESTORE_TOPIC, UPDATE_TOPIC],
  updateWorkshop: [ADD_WORKSHOP, ARCHIVE_WORKSHOP, RESTORE_WORKSHOP],
  updateWorkshops: [UPDATE_WORKSHOPS_CONTENT]
}

let debouncedUpdateChapter = null

const getDebouncedUpdateChapter = (storage) => {
  if (!debouncedUpdateChapter) {
    debouncedUpdateChapter = debounce((...args) => {
      storage.updateChapter.apply(storage, args)
    }, 50)
  }

  return debouncedUpdateChapter
}

export const chapterAutosaverPlugin = store => {
  store.subscribe((mutation, state) => {
    // Make sure we know the user type before handling mutations
    state.user.userPromise.then(user => {
      const storage = getStorageApi(user)
      handleMutation(mutation, state, storage, getDebouncedUpdateChapter(storage))
    })
  })
}

function handleMutation (mutation, state, storage, debouncedUpdateChapter) {
  const { type, payload } = mutation
  const documentGuid = state.document.currentDocument && state.document.currentDocument.guid

  if (mutations.addDocument.includes(type)) {
    storage.addDocument(payload)
    return
  }

  if (mutations.deleteDocument.includes(type)) {
    storage.deleteDocument(payload.guid)
    return
  }

  if (mutations.updateDocument.includes(type)) {
    storage.updateDocument(payload)
    return
  }

  if (!documentGuid) {
    return
  }

  if (mutations.deleteChapter.includes(type)) {
    storage.deleteChapter(documentGuid, payload.chapter.guid)
    return
  }

  if (mutations.deletePlan.includes(type)) {
    storage.deletePlan(documentGuid, payload.plan.guid)
    return
  }

  if (mutations.deleteSection.includes(type)) {
    storage.deleteSection(documentGuid, payload.plan.guid, payload.section.guid)
    return
  }

  if (mutations.deleteTopic.includes(type)) {
    storage.deleteTopic(documentGuid, payload.topic.guid)
    return
  }

  if (mutations.deleteWorkshop.includes(type)) {
    storage.deleteWorkshop(documentGuid, payload.workshop.guid)
    return
  }

  if (mutations.rearrangeChapter.includes(type)) {
    storage.arrangeChapters(documentGuid, payload.chapters.map(chapter => chapter.guid))
    return
  }

  if (mutations.rearrangePlan.includes(type)) {
    storage.arrangePlans(documentGuid, payload.plans.map(plan => plan.guid))
    return
  }

  if (mutations.rearrangeSection.includes(type)) {
    storage.arrangeSections(documentGuid, payload.plan.guid, payload.sections.map(section => section.guid))
    return
  }

  if (mutations.rearrangeTopic.includes(type)) {
    storage.arrangeTopics(documentGuid, payload.topics.map(topic => topic.guid))
    return
  }

  if (mutations.updateChapter.includes(type)) {
    debouncedUpdateChapter(documentGuid, payload.chapter.guid, payload.chapter)
    return
  }

  if (mutations.updatePlan.includes(type)) {
    storage.updatePlan(documentGuid, payload.plan.guid, payload.plan)
    return
  }

  if (mutations.updateSection.includes(type)) {
    storage.updateSection(documentGuid, payload.plan.guid, payload.section.guid, payload.section)
    return
  }

  if (mutations.updateTopic.includes(type)) {
    storage.updateTopic(documentGuid, payload.topic.guid, payload.topic)
    return
  }

  if (mutations.updateWorkshop.includes(type)) {
    storage.updateWorkshops(documentGuid, [payload.workshop])
  }

  if (mutations.updateWorkshops.includes(type)) {
    storage.updateWorkshops(documentGuid, payload.workshopUpdates.map(update => update.workshop))
  }
}
