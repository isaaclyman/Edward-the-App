import clone from 'lodash/clone'
import localForage from 'localforage'
import { orderPromises } from '../../../utilities'
import uniq from 'lodash/uniq'

class LocalStorageApi {
  constructor(username) {
    localForage.setDriver([localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE])
    this.storage = localForage
    window._storage = this.storage
    this.getStorageKeys = () => this.storage.keys()

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

    this.legacyDocumentGuids = 'DOCUMENT_IDS'
    this.documentGuidsKey = `${username}_DOCUMENT_IDS`
    this.documentsKey = documentGuid => `DOCUMENT_${documentGuid}`
  }

  // INFO
  isPremium() {
    return false
  }

  addDocument({ guid, name }) {
    return this._getAllDocumentGuids().then((documentGuids) => {
      if (!documentGuids.includes(guid)) {
        documentGuids.push(guid)
        return this.storage.setItem(this.documentGuidsKey, documentGuids)
      }
    }).then(() => this.storage.setItem(this.documentsKey(guid), { guid, name }))
  }

  arrangeChapters(documentGuid, chapterGuids) {
    return this.storage.setItem(this.chapterOrderKey(documentGuid), chapterGuids)
  }

  arrangePlans(documentGuid, planGuids) {
    return this.storage.setItem(this.planOrderKey(documentGuid), planGuids)
  }

  arrangeSections(documentGuid, planGuid, sectionGuids) {
    return this.storage.setItem(this.sectionOrderKey(documentGuid, planGuid), sectionGuids)
  }

  arrangeTopics(documentGuid, topicGuids) {
    return this.storage.setItem(this.topicOrderKey(documentGuid), topicGuids)
  }

  deleteChapter(documentGuid, chapterGuid) {
    const key = this.getChapterKey(documentGuid, chapterGuid)
    return this.storage.removeItem(key)
  }

  deleteDocument(guid) {
    // Remove document from document list
    return this._getAllDocumentGuids().then((documentGuids) => {
      if (documentGuids.includes(guid)) {
        documentGuids.splice(documentGuids.indexOf(guid), 1)
      }

      return this.storage.setItem(this.documentGuidsKey, documentGuids)
    }).then(() =>
      // Remove all content (chapters, plans, sections, topics)
      Promise.all([
        this._getAllChapters(guid).then(chapters =>
          Promise.all(chapters.map(chapter => this.deleteChapter(guid, chapter.guid)))),
        this._getAllPlans(guid).then(plans => Promise.all(plans.map(plan => this._getAllSections(guid, plan.guid).then(sections =>
          Promise.all(sections.map(section => this.deleteSection(guid, plan.guid, section.guid)))).then(() => this.deletePlan(guid, plan.guid))))),
        this._getAllTopics(guid).then(topics =>
          Promise.all(topics.map(topic => this.deleteTopic(guid, topic.guid)))),
      ]).then(() => this.storage.removeItem(this.documentsKey(guid))))
  }

  deletePlan(documentGuid, planGuid) {
    const key = this.getPlanKey(documentGuid, planGuid)
    return this.storage.removeItem(key)
  }

  deleteSection(documentGuid, planGuid, sectionGuid) {
    const key = this.getSectionKey(documentGuid, planGuid, sectionGuid)
    return this.storage.removeItem(key)
  }

  deleteTopic(documentGuid, topicGuid) {
    const key = this.getTopicKey(documentGuid, topicGuid)
    return this.storage.removeItem(key)
  }

  deleteWorkshop() {
    throw new Error('Workshops are a Premium-only feature.')
  }

  _getAllChapters(documentGuid) {
    const prefix = this.chapterKeyPrefix(documentGuid)

    return Promise.all([
      this._getChaptersSortOrder(documentGuid),
      this.getStorageKeys().then(keys => keys.filter(key => key.startsWith(prefix))),
    ]).then(([sortOrder, keys]) => Promise.all(keys.map(key => this.storage.getItem(key))).then((chapters) => {
      chapters.sort((chap1, chap2) => sortOrder.indexOf(chap1.guid) - sortOrder.indexOf(chap2.guid))

      return chapters
    }))
  }

  getAllChapters(documentGuid) {
    return this._getAllChapters(documentGuid)
  }

  _getAllDocumentGuids() {
    // Migrate old document guids to an email-identified key
    return Promise.all([
      this.storage.getItem(this.legacyDocumentGuids),
      this.storage.getItem(this.documentGuidsKey),
    ]).then(([legacyGuids, guids]) => {
      if (Array.isArray(legacyGuids)) {
        const allGuids = uniq(legacyGuids.concat(guids || []))
        return (
          this.storage.setItem(this.documentGuidsKey, allGuids)
            .then(() => this.storage.removeItem(this.legacyDocumentGuids))
            .then(() => allGuids)
        )
      }
      return uniq(guids || [])
    })
  }

  _getAllDocuments() {
    return this._getAllDocumentGuids().then(guids => Promise.all(guids.map((guid) => {
      const key = this.documentsKey(guid)
      return this.storage.getItem(key)
    })))
  }

  getAllDocuments() {
    return this._getAllDocuments()
  }

  _getAllPlans(documentGuid) {
    const prefix = this.planKeyPrefix(documentGuid)

    return Promise.all([
      this._getPlansSortOrder(documentGuid),
      this.getStorageKeys().then(keys => keys.filter(key => key.startsWith(prefix))),
    ]).then(([sortOrder, keys]) => Promise.all(keys.map(key => this.storage.getItem(key))).then(plans => Promise.all(plans.map(plan => this._getAllSections(documentGuid, plan.guid).then((sections) => {
      plan.sections = sections
    }))).then(() => {
      plans.sort((plan1, plan2) => sortOrder.indexOf(plan1.guid) - sortOrder.indexOf(plan2.guid))
      return plans
    })))
  }

  getAllPlans(documentGuid) {
    return this._getAllPlans(documentGuid)
  }

  _getAllSections(documentGuid, planGuid) {
    const prefix = this.sectionKeyPrefix(documentGuid, planGuid)

    return Promise.all([
      this._getSectionSortOrder(documentGuid, planGuid),
      this.getStorageKeys().then(keys => keys.filter(key => key.startsWith(prefix))),
    ]).then(([sortOrder, keys]) => Promise.all(keys.map(key => this.storage.getItem(key))).then((sections) => {
      sections.sort((section1, section2) => sortOrder.indexOf(section1.guid) - sortOrder.indexOf(section2.guid))
      return sections
    }))
  }

  _getAllTopics(documentGuid) {
    const prefix = this.topicKeyPrefix(documentGuid)

    return Promise.all([
      this._getTopicsSortOrder(documentGuid),
      this.getStorageKeys().then(keys => keys.filter(key => key.startsWith(prefix))),
    ]).then(([sortOrder, keys]) => Promise.all(keys.map(key => this.storage.getItem(key))).then((topics) => {
      topics.sort((topic1, topic2) => sortOrder.indexOf(topic1.guid) - sortOrder.indexOf(topic2.guid))
      return topics
    }))
  }

  getAllTopics(documentGuid) {
    return this._getAllTopics(documentGuid)
  }

  _getChaptersSortOrder(documentGuid) {
    return this.storage.getItem(this.chapterOrderKey(documentGuid)).then(sortOrder => sortOrder || [])
  }

  _getPlansSortOrder(documentGuid) {
    return this.storage.getItem(this.planOrderKey(documentGuid)).then(sortOrder => sortOrder || [])
  }

  _getSectionSortOrder(documentGuid, planGuid) {
    return this.storage.getItem(this.sectionOrderKey(documentGuid, planGuid)).then(sortOrder => sortOrder || [])
  }

  _getTopicsSortOrder(documentGuid) {
    return this.storage.getItem(this.topicOrderKey(documentGuid)).then(sortOrder => sortOrder || [])
  }

  getAllWorkshops() {
    throw new Error('Workshops are a Premium-only feature.')
  }

  saveAllContent(documentGuid, { chapters, plans, topics }) {
    const updateTopicFns = topics.map(topic => () => this.updateTopic(documentGuid, topic.guid, topic))
    const updateTopicPromise = orderPromises(updateTopicFns)
    const updateChapterPromise = updateTopicPromise.then(() => {
      const updateChapterFns = chapters.map(chapter => () => this.updateChapter(documentGuid, chapter.guid, chapter))
      return orderPromises(updateChapterFns)
    })

    const updatePlanFns = plans.map(plan => () => this.updatePlan(documentGuid, plan.guid, plan).then(() => {
      const updateSectionFns = plan.sections.map(section => () => this.updateSection(documentGuid, plan.guid, section.guid, section))
      return orderPromises(updateSectionFns)
    }))
    const updatePlanPromise = orderPromises(updatePlanFns)

    return Promise.all([updateChapterPromise, updatePlanPromise])
  }

  updateChapter(documentGuid, chapterGuid, chapter) {
    if (!documentGuid) {
      return
    }

    const key = this.getChapterKey(documentGuid, chapterGuid)
    return Promise.all([
      this.storage.setItem(key, chapter),
      this._getChaptersSortOrder(documentGuid).then((sortOrder = []) => {
        if (!sortOrder.includes(chapterGuid)) {
          sortOrder.push(chapterGuid)
          return this.arrangeChapters(documentGuid, sortOrder)
        }
      }),
    ])
  }

  updateDocument({ guid, name }) {
    return this.storage.setItem(this.documentsKey(guid), { guid, name })
  }

  updatePlan(documentGuid, planGuid, plan) {
    if (!documentGuid) {
      return
    }

    const key = this.getPlanKey(documentGuid, planGuid)

    plan = clone(plan)
    plan.sections = null

    return Promise.all([
      this.storage.setItem(key, plan),
      this._getPlansSortOrder(documentGuid).then((sortOrder = []) => {
        if (!sortOrder.includes(planGuid)) {
          sortOrder.push(planGuid)
          return this.arrangePlans(documentGuid, sortOrder)
        }
      }),
    ])
  }

  updateSection(documentGuid, planGuid, sectionGuid, section) {
    if (!documentGuid) {
      return
    }

    const key = this.getSectionKey(documentGuid, planGuid, sectionGuid)

    return Promise.all([
      this.storage.setItem(key, section),
      this._getSectionSortOrder(documentGuid, planGuid).then((sortOrder = []) => {
        if (!sortOrder.includes(sectionGuid)) {
          sortOrder.push(sectionGuid)
          return this.arrangeSections(documentGuid, sortOrder)
        }
      }),
    ])
  }

  updateTopic(documentGuid, topicGuid, topic) {
    if (!documentGuid) {
      return
    }

    const key = this.getTopicKey(documentGuid, topicGuid)

    return Promise.all([
      this.storage.setItem(key, topic),
      this._getTopicsSortOrder(documentGuid).then((sortOrder = []) => {
        if (!sortOrder.includes(topicGuid)) {
          sortOrder.push(topicGuid)
          return this.arrangeTopics(documentGuid, sortOrder)
        }
      }),
    ])
  }

  updateWorkshops() {
    throw new Error('Workshops are a Premium-only feature.')
  }

  /*
    FULL EXPORT / IMPORT
  */

  docExport(guid, name) {
    return Promise.all([
      this._getAllChapters(guid),
      this._getAllTopics(guid),
      this._getAllPlans(guid).then(plans => Promise.all(plans.map(plan => this._getAllSections(guid, plan.guid).then((sections) => {
        plan.sections = sections
        return plan
      })))),
    ]).then(([chapters, topics, plans]) => {
      const doc = {
        guid,
        name,
        chapters,
        topics,
        plans,
      }
      return doc
    })
  }

  docImport(doc) {
    let backup
    return this.docExport(doc.guid).then((_backup) => {
      backup = _backup
    }).then(() => this.deleteDocument(doc.guid)).then(() => {
      if (!doc) {
        throw new Error('Attempted to import an empty backup')
      }

      return this.addDocument(doc).then(() => this.saveAllContent(doc.guid, doc))
    })
      .then(undefined, (err) => {
        console.error(err)
        return this.addDocument(backup).then(() => this.saveAllContent(backup.guid, backup))
      })
  }

  getFullExport() {
    return this._getAllDocuments().then(documents => Promise.all(documents.map(doc => Promise.all([
      this._getAllChapters(doc.guid),
      this._getAllTopics(doc.guid),
      this._getAllPlans(doc.guid).then(plans => Promise.all(plans.map(plan =>
        this._getAllSections(doc.guid, plan.guid).then((sections) => {
          plan.sections = sections
          return plan
        })))),
    ]).then(([chapters, topics, plans]) => {
      doc.chapters = chapters
      doc.topics = topics
      doc.plans = plans
      return doc
    }))))
  }

  revertImport(backup) {
    return (
      Promise.all(Object.keys(backup).map(key => this.storage.setItem(key, backup[key])))
        .then(undefined, (importErr) => {
          console.error(importErr)
          throw importErr
        })
    )
  }

  doFullImport(documents) {
    const backup = {}

    return this.storage.iterate((value, key) => {
      backup[key] = value
    }).then(() => this.storage.clear().then(() => {
      if (!documents || !Array.isArray(documents) || !documents.length) {
        throw new Error('Attempted to import an empty backup')
      }

      const addDocumentPromises = documents.map(doc =>
        () => this.addDocument(doc).then(() => this.saveAllContent(doc.guid, doc)))

      return orderPromises(addDocumentPromises)
    })).then(undefined, (err) => {
      console.error(err)
      return this.revertImport(backup)
    })
  }
}

export default LocalStorageApi
