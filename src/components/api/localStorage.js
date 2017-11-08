import clone from 'lodash/clone'

class LocalStorageApi {
  constructor () {
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
    let documentIds = this._getAllDocumentIds()
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

  deleteDocument (id) {
    // Remove document from document list
    let documentIds = this._getAllDocumentIds()

    if (documentIds.includes(id)) {
      documentIds.splice(documentIds.indexOf(id), 1)
    }

    this.storage.setItem(this.documentIdsKey, JSON.stringify(documentIds))

    // Remove all content (chapters, plans, sections, topics)
    this._getAllChapters(id).forEach(chapter => this.deleteChapter(id, chapter.id))
    this._getAllPlans(id).forEach(plan => {
      this._getAllSections(id, plan.id).forEach(section => this.deleteSection(id, plan.id, section.id))
      this.deletePlan(id, plan.id)
    })
    this._getAllTopics(id).forEach(topic => this.deleteTopic(id, topic.id))

    // Remove document metadata
    this.storage.removeItem(this.documentsKey(id))
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

  _getAllChapters (fileId) {
    const prefix = this.chapterKeyPrefix(fileId)
    const sortOrder = this._getChaptersSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const chapters = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((chap1, chap2) => {
      return sortOrder.indexOf(chap1.id) - sortOrder.indexOf(chap2.id)
    })

    return chapters
  }

  getAllChapters (fileId) {
    const chapters = this._getAllChapters(fileId)
    return Promise.resolve(chapters)
  }

  _getAllDocumentIds () {
    const documentIds = JSON.parse(this.storage.getItem(this.documentIdsKey)) || []
    return documentIds
  }

  _getAllDocuments () {
    const documents = this._getAllDocumentIds().map(id => {
      const key = this.documentsKey(id)
      return JSON.parse(this.storage.getItem(key))
    })
    return documents
  }

  getAllDocuments () {
    const documents = this._getAllDocuments()
    return Promise.resolve(documents)
  }

  _getAllPlans (fileId) {
    const prefix = this.planKeyPrefix(fileId)
    const sortOrder = this._getPlansSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const plans = keys.map(key => JSON.parse(this.storage.getItem(key)))
      .map(plan => {
        plan.sections = this._getAllSections(fileId, plan.id)
        return plan
      })
      .sort((plan1, plan2) => {
        return sortOrder.indexOf(plan1.id) - sortOrder.indexOf(plan2.id)
      })

    return plans
  }

  getAllPlans (fileId) {
    const plans = this._getAllPlans(fileId)
    return Promise.resolve(plans)
  }

  _getAllSections (fileId, planId) {
    const prefix = this.sectionKeyPrefix(fileId, planId)
    const sortOrder = this._getSectionSortOrder(fileId, planId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const sections = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((section1, section2) => {
      return sortOrder.indexOf(section1.id) - sortOrder.indexOf(section2.id)
    })

    return sections
  }

  _getAllTopics (fileId) {
    const prefix = this.topicKeyPrefix(fileId)
    const sortOrder = this._getTopicsSortOrder(fileId)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const topics = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((topic1, topic2) => {
      return sortOrder.indexOf(topic1.id) - sortOrder.indexOf(topic2.id)
    })

    return topics
  }

  getAllTopics (fileId) {
    const topics = this._getAllTopics(fileId)
    return Promise.resolve(topics)
  }

  _getChaptersSortOrder (fileId) {
    const sortOrder = JSON.parse(this.storage.getItem(this.chapterOrderKey(fileId))) || []
    return sortOrder
  }

  _getPlansSortOrder (fileId) {
    const sortOrder = JSON.parse(this.storage.getItem(this.planOrderKey(fileId))) || []
    return sortOrder
  }

  _getSectionSortOrder (fileId, planId) {
    const sortOrder = JSON.parse(this.storage.getItem(this.sectionOrderKey(fileId, planId))) || []
    return sortOrder
  }

  _getTopicsSortOrder (fileId) {
    const sortOrder = JSON.parse(this.storage.getItem(this.topicOrderKey(fileId))) || []
    return sortOrder
  }

  saveAllContent (fileId, { chapters, plans, topics }) {
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

    let sortOrder = this._getChaptersSortOrder(fileId) || []
    if (!sortOrder.includes(chapterId)) {
      sortOrder.push(chapterId)
      this.arrangeChapters(fileId, sortOrder)
    }
  }

  updateDocument ({ id, name }) {
    this.storage.setItem(this.documentsKey(id), JSON.stringify({ id, name }))
  }

  updatePlan (fileId, planId, plan) {
    if (!fileId) {
      return
    }

    const key = this.getPlanKey(fileId, planId)

    plan = clone(plan)
    plan.sections = null
    this.storage.setItem(key, JSON.stringify(plan))

    let sortOrder = this._getPlansSortOrder(fileId) || []
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

    let sortOrder = this._getSectionSortOrder(fileId, planId) || []
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

    let sortOrder = this._getTopicsSortOrder(fileId) || []
    if (!sortOrder.includes(topicId)) {
      sortOrder.push(topicId)
      this.arrangeTopics(fileId, sortOrder)
    }
  }
}

export default LocalStorageApi
