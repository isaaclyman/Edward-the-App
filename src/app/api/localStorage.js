import clone from 'lodash/clone'

class LocalStorageApi {
  constructor () {
    this.storage = window.localStorage
    this.getStorageKeys = () => Object.keys(window.localStorage)

    this.planKeyPrefix = documentGuid => `${documentGuid}_PLAN_DATA_`
    this.planOrderKey = documentGuid => `${documentGuid}_PLAN_ORDER`
    this.getPlanKey = (documentGuid, planGuid) => `${this.planKeyPrefix(documentGuid)}${planGuid}`

    this.sectionKeyPrefix = (documentGuid, planGuid) => `${documentGuid}_SECTION_DATA_${planGuid}_`
    this.sectionOrderKey = (documentGuid, planGuid) => `${documentGuid}_SECTION_ORDER_${planGuid}`
    this.getSectionKey = (documentGuid, planGuid, sectionGuid) => `${this.sectionKeyPrefix(documentGuid, planGuid)}${sectionGuid}`

    this.chapterKeyPrefix = documentGuid => `${documentGuid}_CHAPTER_DATA_`
    this.chapterOrderKey = documentGuid => `${documentGuid}_CHAPTER_ORDER`
    this.getChapterKey = (documentGuid, chapterGuid) => `${this.chapterKeyPrefix(documentGuid)}${chapterGuid}`

    this.topicKeyPrefix = documentGuid => `${documentGuid}_TOPIC_DATA_`
    this.topicOrderKey = documentGuid => `${documentGuid}_TOPIC_ORDER`
    this.getTopicKey = (documentGuid, topicGuid) => `${this.topicKeyPrefix(documentGuid)}${topicGuid}`

    this.documentGuidsKey = 'DOCUMENT_IDS'
    this.documentsKey = documentGuid => `DOCUMENT_${documentGuid}`
  }

  addDocument ({ guid, name }) {
    let documentGuids = this._getAllDocumentGuids()
    documentGuids.push(guid)
    this.storage.setItem(this.documentGuidsKey, JSON.stringify(documentGuids))

    this.storage.setItem(this.documentsKey(guid), JSON.stringify({ guid, name }))
  }

  arrangeChapters (documentGuid, chapterGuids) {
    this.storage.setItem(this.chapterOrderKey(documentGuid), JSON.stringify(chapterGuids))
  }

  arrangePlans (documentGuid, planGuids) {
    this.storage.setItem(this.planOrderKey(documentGuid), JSON.stringify(planGuids))
  }

  arrangeSections (documentGuid, planGuid, sectionGuids) {
    this.storage.setItem(this.sectionOrderKey(documentGuid, planGuid), JSON.stringify(sectionGuids))
  }

  arrangeTopics (documentGuid, topicGuids) {
    this.storage.setItem(this.topicOrderKey(documentGuid), JSON.stringify(topicGuids))
  }

  deleteChapter (documentGuid, chapterGuid) {
    const key = this.getChapterKey(documentGuid, chapterGuid)
    this.storage.removeItem(key)
  }

  deleteDocument (guid) {
    // Remove document from document list
    let documentGuids = this._getAllDocumentGuids()

    if (documentGuids.includes(guid)) {
      documentGuids.splice(documentGuids.indexOf(guid), 1)
    }

    this.storage.setItem(this.documentGuidsKey, JSON.stringify(documentGuids))

    // Remove all content (chapters, plans, sections, topics)
    this._getAllChapters(guid).forEach(chapter => this.deleteChapter(guid, chapter.guid))
    this._getAllPlans(guid).forEach(plan => {
      this._getAllSections(guid, plan.guid).forEach(section => this.deleteSection(guid, plan.guid, section.guid))
      this.deletePlan(guid, plan.guid)
    })
    this._getAllTopics(guid).forEach(topic => this.deleteTopic(guid, topic.guid))

    // Remove document metadata
    this.storage.removeItem(this.documentsKey(guid))
  }

  deletePlan (documentGuid, planGuid) {
    const key = this.getPlanKey(documentGuid, planGuid)
    this.storage.removeItem(key)
  }

  deleteSection (documentGuid, planGuid, sectionGuid) {
    const key = this.getSectionKey(documentGuid, planGuid, sectionGuid)
    this.storage.removeItem(key)
  }

  deleteTopic (documentGuid, topicGuid) {
    const key = this.getTopicKey(documentGuid, topicGuid)
    this.storage.removeItem(key)
  }

  _getAllChapters (documentGuid) {
    const prefix = this.chapterKeyPrefix(documentGuid)
    const sortOrder = this._getChaptersSortOrder(documentGuid)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const chapters = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((chap1, chap2) => {
      return sortOrder.indexOf(chap1.guid) - sortOrder.indexOf(chap2.guid)
    })

    return chapters
  }

  getAllChapters (documentGuid) {
    const chapters = this._getAllChapters(documentGuid)
    return Promise.resolve(chapters)
  }

  _getAllDocumentGuids () {
    const documentGuids = JSON.parse(this.storage.getItem(this.documentGuidsKey)) || []
    return documentGuids
  }

  _getAllDocuments () {
    const documents = this._getAllDocumentGuids().map(guid => {
      const key = this.documentsKey(guid)
      return JSON.parse(this.storage.getItem(key))
    })
    return documents
  }

  getAllDocuments () {
    const documents = this._getAllDocuments()
    return Promise.resolve(documents)
  }

  _getAllPlans (documentGuid) {
    const prefix = this.planKeyPrefix(documentGuid)
    const sortOrder = this._getPlansSortOrder(documentGuid)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const plans = keys.map(key => JSON.parse(this.storage.getItem(key)))
      .map(plan => {
        plan.sections = this._getAllSections(documentGuid, plan.guid)
        return plan
      })
      .sort((plan1, plan2) => {
        return sortOrder.indexOf(plan1.guid) - sortOrder.indexOf(plan2.guid)
      })

    return plans
  }

  getAllPlans (documentGuid) {
    const plans = this._getAllPlans(documentGuid)
    return Promise.resolve(plans)
  }

  _getAllSections (documentGuid, planGuid) {
    const prefix = this.sectionKeyPrefix(documentGuid, planGuid)
    const sortOrder = this._getSectionSortOrder(documentGuid, planGuid)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const sections = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((section1, section2) => {
      return sortOrder.indexOf(section1.guid) - sortOrder.indexOf(section2.guid)
    })

    return sections
  }

  _getAllTopics (documentGuid) {
    const prefix = this.topicKeyPrefix(documentGuid)
    const sortOrder = this._getTopicsSortOrder(documentGuid)
    const keys = this.getStorageKeys().filter(key => key.startsWith(prefix))
    const topics = keys.map(key => JSON.parse(this.storage.getItem(key))).sort((topic1, topic2) => {
      return sortOrder.indexOf(topic1.guid) - sortOrder.indexOf(topic2.guid)
    })

    return topics
  }

  getAllTopics (documentGuid) {
    const topics = this._getAllTopics(documentGuid)
    return Promise.resolve(topics)
  }

  _getChaptersSortOrder (documentGuid) {
    const sortOrder = JSON.parse(this.storage.getItem(this.chapterOrderKey(documentGuid))) || []
    return sortOrder
  }

  _getPlansSortOrder (documentGuid) {
    const sortOrder = JSON.parse(this.storage.getItem(this.planOrderKey(documentGuid))) || []
    return sortOrder
  }

  _getSectionSortOrder (documentGuid, planGuid) {
    const sortOrder = JSON.parse(this.storage.getItem(this.sectionOrderKey(documentGuid, planGuid))) || []
    return sortOrder
  }

  _getTopicsSortOrder (documentGuid) {
    const sortOrder = JSON.parse(this.storage.getItem(this.topicOrderKey(documentGuid))) || []
    return sortOrder
  }

  saveAllContent (documentGuid, { chapters, plans, topics }) {
    chapters.forEach(chapter => this.updateChapter(documentGuid, chapter.guid, chapter))
    plans.forEach(plan => {
      this.updatePlan(documentGuid, plan.guid, plan)

      plan.sections.forEach(section => {
        this.updateSection(documentGuid, plan.guid, section.guid, section)
      })
    })
    topics.forEach(topic => this.updateTopic(documentGuid, topic.guid, topic))
  }

  updateChapter (documentGuid, chapterGuid, chapter) {
    if (!documentGuid) {
      return
    }

    const key = this.getChapterKey(documentGuid, chapterGuid)
    this.storage.setItem(key, JSON.stringify(chapter))

    let sortOrder = this._getChaptersSortOrder(documentGuid) || []
    if (!sortOrder.includes(chapterGuid)) {
      sortOrder.push(chapterGuid)
      this.arrangeChapters(documentGuid, sortOrder)
    }
  }

  updateDocument ({ guid, name }) {
    this.storage.setItem(this.documentsKey(guid), JSON.stringify({ guid, name }))
  }

  updatePlan (documentGuid, planGuid, plan) {
    if (!documentGuid) {
      return
    }

    const key = this.getPlanKey(documentGuid, planGuid)

    plan = clone(plan)
    plan.sections = null
    this.storage.setItem(key, JSON.stringify(plan))

    let sortOrder = this._getPlansSortOrder(documentGuid) || []
    if (!sortOrder.includes(planGuid)) {
      sortOrder.push(planGuid)
      this.arrangePlans(documentGuid, sortOrder)
    }
  }

  updateSection (documentGuid, planGuid, sectionGuid, section) {
    if (!documentGuid) {
      return
    }

    const key = this.getSectionKey(documentGuid, planGuid, sectionGuid)
    this.storage.setItem(key, JSON.stringify(section))

    let sortOrder = this._getSectionSortOrder(documentGuid, planGuid) || []
    if (!sortOrder.includes(sectionGuid)) {
      sortOrder.push(sectionGuid)
      this.arrangeSections(documentGuid, sortOrder)
    }
  }

  updateTopic (documentGuid, topicGuid, topic) {
    if (!documentGuid) {
      return
    }

    const key = this.getTopicKey(documentGuid, topicGuid)
    this.storage.setItem(key, JSON.stringify(topic))

    let sortOrder = this._getTopicsSortOrder(documentGuid) || []
    if (!sortOrder.includes(topicGuid)) {
      sortOrder.push(topicGuid)
      this.arrangeTopics(documentGuid, sortOrder)
    }
  }

  /*
    FULL EXPORT / IMPORT
  */

  getFullExport () {
    const documents = this._getAllDocuments().map(doc => {
      doc.chapters = this._getAllChapters(doc.guid)
      doc.topics = this._getAllTopics(doc.guid)
      doc.plans = this._getAllPlans(doc.guid).map(plan => {
        plan.sections = this._getAllSections(doc.guid, plan.guid)
        return plan
      })
      return doc
    })

    return Promise.resolve(documents)
  }

  doFullImport (documents) {
    const backup = JSON.parse(JSON.stringify(this.storage))
    try {
      this.storage.clear()

      if (!documents || !Array.isArray(documents) || !documents.length) {
        throw new Error('Attempted to import an empty backup.')
      }

      for (const doc of documents) {
        this.addDocument(doc)
        this.saveAllContent(doc.guid, doc)
      }
    } catch (err) {
      Object.keys(backup).forEach(key => {
        this.storage.setItem(key, backup[key])
      })
      console.error(err)
    }
  }
}

export default LocalStorageApi
