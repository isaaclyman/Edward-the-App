import clone from 'lodash/clone'

class ChapterStorage {
  constructor () {
    this.accountType = 'Limited Account'
    this.accountMessage = 'Data is stored unsafely on your computer and may be lost.'
    this.storage = window.localStorage
    this.getStorageKeys = () => Object.keys(window.localStorage)

    this.planKeyPrefix = fileId => `${fileId}_PLAN_DATA_`
    this.planOrderKey = fileId => `${fileId}_PLAN_ORDER`
    this.getPlanKey = (fileId, planId) => `${this.planKeyPrefix(fileId)}${planId}`

    this.sectionKeyPrefix = (fileId, planId) => `${fileId}_SECTION_DATA_${planId}_`
    this.sectionOrderKey = (fileId, planId) => `${fileId}_SECTION_ORDER_${planId}`
    this.getSectionKey = (fileId, planId, sectionId) => `${this.sectionKeyPrefix(fileId, planId)}${sectionId}`

    this.chapterKeyPrefix = fileId => `${fileId}_CHAPTER_DATA_`
    this.chapterOrderKey = fileId => `${fileId}_CHAPTER_ORDER`
    this.getChapterKey = (fileId, chapterId) => `${this.chapterKeyPrefix(fileId)}${chapterId}`

    this.topicKeyPrefix = fileId => `${fileId}_TOPIC_DATA_`
    this.topicOrderKey = fileId => `${fileId}_TOPIC_ORDER`
    this.getTopicKey = (fileId, topicId) => `${this.topicKeyPrefix(fileId)}${topicId}`

    this.documentIdsKey = 'DOCUMENT_IDS'
    this.documentsKey = fileId => `DOCUMENT_${fileId}`
  }

  addDocument ({ id, name }) {
    let documentIds = this.getAllDocumentIds()
    documentIds.push(id)
    this.storage.setItem(this.documentIdsKey, JSON.stringify(documentIds))

    this.storage.setItem(this.documentsKey(id), JSON.stringify({ id, name }))
  }

  arrangeChapters (fileId, chapterIds) {
    this.storage.setItem(this.chapterOrderKey(fileId), JSON.stringify(chapterIds))
  }

  arrangePlans (fileId, planIds) {
    this.storage.setItem(this.planOrderKey(fileId), JSON.stringify(planIds))
  }

  arrangeSections (fileId, planId, sectionIds) {
    this.storage.setItem(this.sectionOrderKey(fileId, planId), JSON.stringify(sectionIds))
  }

  arrangeTopics (fileId, topicIds) {
    this.storage.setItem(this.topicOrderKey(fileId), JSON.stringify(topicIds))
  }

  deleteChapter (fileId, chapterId) {
    const key = this.getChapterKey(fileId, chapterId)
    this.storage.removeItem(key)
  }

  deletePlan (fileId, planId) {
    const key = this.getPlanKey(fileId, planId)
    this.storage.removeItem(key)
  }

  deleteSection (fileId, planId, sectionId) {
    const key = this.getSectionKey(fileId, planId, sectionId)
    this.storage.removeItem(key)
  }

  deleteTopic (fileId, topicId) {
    const key = this.getTopicKey(fileId, topicId)
    this.storage.removeItem(key)
  }

  getAllChapters (fileId) {
    const prefix = this.chapterKeyPrefix(fileId)
    const sortOrder = this.getChaptersSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const chapters = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((chap1, chap2) => {
      return sortOrder.indexOf(chap1.id) - sortOrder.indexOf(chap2.id)
    })

    return chapters
  }

  getAllDocumentIds () {
    return JSON.parse(this.storage.getItem(this.documentIdsKey)) || []
  }

  getAllDocuments () {
    return this.getAllDocumentIds().map(id => {
      const key = this.documentsKey(id)
      return JSON.parse(this.storage.getItem(key))
    })
  }

  getAllPlans (fileId) {
    const prefix = this.planKeyPrefix(fileId)
    const sortOrder = this.getPlansSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const plans = keys.map(key => JSON.parse(this.storage.getItem(key)))
      .map(plan => {
        plan.sections = this.getAllSections(fileId, plan.id)
        return plan
      })
      .sort((plan1, plan2) => {
        return sortOrder.indexOf(plan1.id) - sortOrder.indexOf(plan2.id)
      })

    return plans
  }

  getAllSections (fileId, planId) {
    const prefix = this.sectionKeyPrefix(fileId, planId)
    const sortOrder = this.getSectionSortOrder(fileId, planId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const sections = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((section1, section2) => {
      return sortOrder.indexOf(section1.id) - sortOrder.indexOf(section2.id)
    })

    return sections
  }

  getAllTopics (fileId) {
    const prefix = this.topicKeyPrefix(fileId)
    const sortOrder = this.getTopicsSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const topics = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((topic1, topic2) => {
      return sortOrder.indexOf(topic1.id) - sortOrder.indexOf(topic2.id)
    })

    return topics
  }

  getChapter (fileId, chapterId) {
    const key = this.getChapterKey(fileId, chapterId)
    return JSON.parse(this.storage.getItem(key))
  }

  getChaptersSortOrder (fileId) {
    return JSON.parse(this.storage.getItem(this.chapterOrderKey(fileId))) || []
  }

  getPlan (fileId, planId) {
    const key = this.getPlanKey(fileId, planId)
    const plan = JSON.parse(this.storage.getItem(key))
    plan.sections = this.getAllSections(fileId, planId)

    return plan
  }

  getPlansSortOrder (fileId) {
    return JSON.parse(this.storage.getItem(this.planOrderKey(fileId))) || []
  }

  getSection (fileId, planId, sectionId) {
    const key = this.getSectionKey(fileId, planId, sectionId)
    return JSON.parse(this.storage.getItem(key))
  }

  getSectionSortOrder (fileId, planId) {
    return JSON.parse(this.storage.getItem(this.sectionOrderKey(fileId, planId))) || []
  }

  getTopic (fileId, topicId) {
    const key = this.getTopicKey(fileId, topicId)
    return JSON.parse(this.storage.getItem(key))
  }

  getTopicsSortOrder (fileId) {
    return JSON.parse(this.storage.getItem(this.topicOrderKey(fileId))) || []
  }

  saveEverything (fileId, { chapters, plans, topics }) {
    chapters.forEach(chapter => this.updateChapter(fileId, chapter.id, chapter))
    plans.forEach(plan => {
      this.updatePlan(fileId, plan.id, plan)

      plan.sections.forEach(section => {
        this.updateSection(fileId, plan.id, section.id, section)
      })
    })
    topics.forEach(topic => this.updateTopic(fileId, topic.id, topic))
  }

  updateChapter (fileId, chapterId, chapter) {
    if (!fileId) {
      return
    }

    const key = this.getChapterKey(fileId, chapterId)
    this.storage.setItem(key, JSON.stringify(chapter))

    let sortOrder = this.getChaptersSortOrder(fileId) || []
    if (!sortOrder.includes(chapterId)) {
      sortOrder.push(chapterId)
      this.arrangeChapters(fileId, sortOrder)
    }
  }

  updatePlan (fileId, planId, plan) {
    if (!fileId) {
      return
    }

    const key = this.getPlanKey(fileId, planId)

    plan = clone(plan)
    plan.sections = null
    this.storage.setItem(key, JSON.stringify(plan))

    let sortOrder = this.getPlansSortOrder(fileId) || []
    if (!sortOrder.includes(planId)) {
      sortOrder.push(planId)
      this.arrangePlans(fileId, sortOrder)
    }
  }

  updateSection (fileId, planId, sectionId, section) {
    if (!fileId) {
      return
    }

    const key = this.getSectionKey(fileId, planId, sectionId)
    this.storage.setItem(key, JSON.stringify(section))

    let sortOrder = this.getSectionSortOrder(fileId, planId) || []
    if (!sortOrder.includes(sectionId)) {
      sortOrder.push(sectionId)
      this.arrangeSections(fileId, sortOrder)
    }
  }

  updateTopic (fileId, topicId, topic) {
    if (!fileId) {
      return
    }

    const key = this.getTopicKey(fileId, topicId)
    this.storage.setItem(key, JSON.stringify(topic))

    let sortOrder = this.getTopicsSortOrder(fileId) || []
    if (!sortOrder.includes(topicId)) {
      sortOrder.push(topicId)
      this.arrangeTopics(fileId, sortOrder)
    }
  }
}

const ChapterStorageSingleton = new ChapterStorage()

export default ChapterStorageSingleton

import { ADD_CHAPTER, ADD_PLAN, ADD_SECTION, ADD_TOPIC, ADD_TOPIC_TO_CHAPTER,
  ARCHIVE_CHAPTER, ARCHIVE_PLAN, ARCHIVE_SECTION, ARCHIVE_TOPIC,
  DELETE_CHAPTER, DELETE_PLAN, DELETE_SECTION, DELETE_TOPIC,
  REARRANGE_CHAPTERS, REARRANGE_PLANS, REARRANGE_SECTIONS, REARRANGE_TOPICS,
  RESTORE_CHAPTER, RESTORE_PLAN, RESTORE_SECTION, RESTORE_TOPIC,
  UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT, UPDATE_PLAN,
  UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS,
  UPDATE_TOPIC, UPDATE_TOPIC_CONTENT } from './chapters.store'

const mutations = {
  deleteChapter: [DELETE_CHAPTER],
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
  updatePlan: [ADD_PLAN, ARCHIVE_PLAN, RESTORE_PLAN, UPDATE_PLAN],
  updateSection: [ADD_SECTION, ARCHIVE_SECTION, RESTORE_SECTION,
    UPDATE_SECTION, UPDATE_SECTION_CONTENT, UPDATE_SECTION_TAGS],
  updateTopic: [ADD_TOPIC, ARCHIVE_TOPIC,
    RESTORE_TOPIC,
    UPDATE_TOPIC]
}

export const chapterAutosaverPlugin = store => {
  store.subscribe((mutation, state) => {
    const { type, payload } = mutation
    const fileId = state.file.currentFile && state.file.currentFile.id

    if (!fileId) {
      return
    }

    if (mutations.deleteChapter.includes(type)) {
      ChapterStorageSingleton.deleteChapter(fileId, payload.chapter.id)
      return
    }

    if (mutations.deletePlan.includes(type)) {
      ChapterStorageSingleton.deletePlan(fileId, payload.plan.id)
      return
    }

    if (mutations.deleteSection.includes(type)) {
      ChapterStorageSingleton.deleteSection(fileId, payload.plan.id, payload.section.id)
      return
    }

    if (mutations.deleteTopic.includes(type)) {
      ChapterStorageSingleton.deleteTopic(fileId, payload.topic.id)
      return
    }

    if (mutations.rearrangeChapter.includes(type)) {
      ChapterStorageSingleton.arrangeChapters(fileId, payload.chapters.map(chapter => chapter.id))
      return
    }

    if (mutations.rearrangePlan.includes(type)) {
      ChapterStorageSingleton.arrangePlans(fileId, payload.plans.map(plan => plan.id))
      return
    }

    if (mutations.rearrangeSection.includes(type)) {
      ChapterStorageSingleton.arrangeSections(fileId, payload.plan.id, payload.sections.map(section => section.id))
      return
    }

    if (mutations.rearrangeTopic.includes(type)) {
      ChapterStorageSingleton.arrangeTopics(fileId, payload.topics.map(topic => topic.id))
      return
    }

    if (mutations.updateChapter.includes(type)) {
      ChapterStorageSingleton.updateChapter(fileId, payload.chapter.id, payload.chapter)
      return
    }

    if (mutations.updatePlan.includes(type)) {
      ChapterStorageSingleton.updatePlan(fileId, payload.plan.id, payload.plan)
      return
    }

    if (mutations.updateSection.includes(type)) {
      ChapterStorageSingleton.updateSection(fileId, payload.plan.id, payload.section.id, payload.section)
      return
    }

    if (mutations.updateTopic.includes(type)) {
      ChapterStorageSingleton.updateTopic(fileId, payload.topic.id, payload.topic)
      return
    }
  })
}
