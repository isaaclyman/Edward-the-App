import { ADD_CHAPTER, ADD_PLAN, ADD_SECTION, ADD_TOPIC, ADD_TOPIC_TO_CHAPTER,
  ARCHIVE_CHAPTER, ARCHIVE_PLAN, ARCHIVE_SECTION, ARCHIVE_TOPIC,
  DELETE_CHAPTER, DELETE_PLAN, DELETE_SECTION, DELETE_TOPIC,
  REARRANGE_CHAPTERS, REARRANGE_PLANS, REARRANGE_SECTIONS, REARRANGE_TOPICS,
  RESTORE_CHAPTER, RESTORE_PLAN, RESTORE_SECTION, RESTORE_TOPIC,
  UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT, UPDATE_PLAN,
  UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS,
  UPDATE_TOPIC, UPDATE_TOPIC_CONTENT } from '../app/chapters.store'

import { ADD_FILE, REMOVE_OWNED_FILE, UPDATE_FILE_NAME } from '../app/file.store'

import { getStorageApi } from './storageSwitch'

const mutations = {
  addDocument: [ADD_FILE],
  deleteChapter: [DELETE_CHAPTER],
  deleteDocument: [REMOVE_OWNED_FILE],
  deletePlan: [DELETE_PLAN],
  deleteSection: [DELETE_SECTION],
  deleteTopic: [DELETE_TOPIC],
  rearrangeChapter: [REARRANGE_CHAPTERS],
  rearrangePlan: [REARRANGE_PLANS],
  rearrangeSection: [REARRANGE_SECTIONS],
  rearrangeTopic: [REARRANGE_TOPICS],
  updateChapter: [ADD_CHAPTER, ADD_TOPIC_TO_CHAPTER, ARCHIVE_CHAPTER,
    RESTORE_CHAPTER,
    UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT, UPDATE_TOPIC_CONTENT],
  updateDocument: [UPDATE_FILE_NAME],
  updatePlan: [ADD_PLAN, ARCHIVE_PLAN, RESTORE_PLAN, UPDATE_PLAN],
  updateSection: [ADD_SECTION, ARCHIVE_SECTION, RESTORE_SECTION,
    UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS],
  updateTopic: [ADD_TOPIC, ARCHIVE_TOPIC,
    RESTORE_TOPIC,
    UPDATE_TOPIC]
}

export const chapterAutosaverPlugin = store => {
  store.subscribe((mutation, state) => {
    // Make sure we know the user type before handling mutations
    state.user.userPromise.then(user => {
      const storage = getStorageApi(user, state)
      handleMutation(mutation, state, storage)
    })
  })
}

function handleMutation (mutation, state, storage) {
  const { type, payload } = mutation
  const fileId = state.file.currentFile && state.file.currentFile.id

  if (mutations.addDocument.includes(type)) {
    storage.addDocument(payload)
    return
  }

  if (mutations.deleteDocument.includes(type)) {
    storage.deleteDocument(payload.id)
    return
  }

  if (mutations.updateDocument.includes(type)) {
    storage.updateDocument(payload)
    return
  }

  if (!fileId) {
    return
  }

  if (mutations.deleteChapter.includes(type)) {
    storage.deleteChapter(fileId, payload.chapter.id)
    return
  }

  if (mutations.deletePlan.includes(type)) {
    storage.deletePlan(fileId, payload.plan.id)
    return
  }

  if (mutations.deleteSection.includes(type)) {
    storage.deleteSection(fileId, payload.plan.id, payload.section.id)
    return
  }

  if (mutations.deleteTopic.includes(type)) {
    storage.deleteTopic(fileId, payload.topic.id)
    return
  }

  if (mutations.rearrangeChapter.includes(type)) {
    storage.arrangeChapters(fileId, payload.chapters.map(chapter => chapter.id))
    return
  }

  if (mutations.rearrangePlan.includes(type)) {
    storage.arrangePlans(fileId, payload.plans.map(plan => plan.id))
    return
  }

  if (mutations.rearrangeSection.includes(type)) {
    storage.arrangeSections(fileId, payload.plan.id, payload.sections.map(section => section.id))
    return
  }

  if (mutations.rearrangeTopic.includes(type)) {
    storage.arrangeTopics(fileId, payload.topics.map(topic => topic.id))
    return
  }

  if (mutations.updateChapter.includes(type)) {
    storage.updateChapter(fileId, payload.chapter.id, payload.chapter)
    return
  }

  if (mutations.updatePlan.includes(type)) {
    storage.updatePlan(fileId, payload.plan.id, payload.plan)
    return
  }

  if (mutations.updateSection.includes(type)) {
    storage.updateSection(fileId, payload.plan.id, payload.section.id, payload.section)
    return
  }

  if (mutations.updateTopic.includes(type)) {
    storage.updateTopic(fileId, payload.topic.id, payload.topic)
    return
  }
}
