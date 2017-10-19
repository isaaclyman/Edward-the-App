class ChapterStorage {
  constructor () {
    this.accountType = 'Limited Account'
    this.accountMessage = 'Data is stored unsafely on your computer and may be lost.'
    this.storage = window.localStorage
    this.getStorageKeys = () => Object.keys(window.localStorage)

    this.chapterKeyPrefix = fileId => `${fileId}_CHAPTER_CONTENT_`
    this.chapterOrderKey = fileId => `${fileId}_CHAPTER_ORDER`
    this.topicKeyPrefix = fileId => `${fileId}_TOPIC_CONTENT_`
    this.topicOrderKey = fileId => `${fileId}_TOPIC_ORDER`

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

  arrangeTopics (fileId, topicIds) {
    this.storage.setItem(this.topicOrderKey(fileId), JSON.stringify(topicIds))
  }

  deleteChapter (fileId, chapterId) {
    const key = this.getChapterKey(fileId, chapterId)
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

  getChapterKey (fileId, chapterId) {
    return `${this.chapterKeyPrefix(fileId)}${chapterId}`
  }

  getChaptersSortOrder (fileId) {
    return JSON.parse(this.storage.getItem(this.chapterOrderKey(fileId))) || []
  }

  getTopic (fileId, topicId) {
    const key = this.getTopicKey(fileId, topicId)
    return JSON.parse(this.storage.getItem(key))
  }

  getTopicKey (fileId, topicId) {
    return `${this.topicKeyPrefix(fileId)}${topicId}`
  }

  getTopicsSortOrder (fileId) {
    return JSON.parse(this.storage.getItem(this.topicOrderKey(fileId))) || []
  }

  syncEverything (fileId, chapters, topics) {
    chapters.forEach(chapter => this.updateChapter(fileId, chapter.id, chapter))
    topics.forEach(topic => this.updateTopic(fileId, topic.id, topic))
  }

  updateChapter (fileId, chapterId, chapter) {
    if (!fileId) {
      return
    }

    const key = this.getChapterKey(fileId, chapterId)
    this.storage.setItem(key, JSON.stringify(chapter))

    let sortOrder = this.getChaptersSortOrder(fileId)
    if (!sortOrder.includes(chapterId)) {
      sortOrder.push(chapterId)
      this.arrangeChapters(fileId, sortOrder)
    }
  }

  updateTopic (fileId, topicId, topic) {
    if (!fileId) {
      return
    }

    const key = this.getTopicKey(fileId, topicId)
    this.storage.setItem(key, JSON.stringify(topic))

    let sortOrder = this.getTopicsSortOrder(fileId)
    if (!sortOrder.includes(topicId)) {
      sortOrder.push(topicId)
      this.arrangeTopics(fileId, sortOrder)
    }
  }
}

const ChapterStorageSingleton = new ChapterStorage()

export default ChapterStorageSingleton

import { ADD_CHAPTER, ADD_TOPIC, ADD_TOPIC_TO_CHAPTER, ARCHIVE_CHAPTER, ARCHIVE_TOPIC,
  DELETE_CHAPTER, DELETE_TOPIC,
  REARRANGE_CHAPTERS, REARRANGE_TOPICS,
  RESTORE_CHAPTER, RESTORE_TOPIC, UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT,
  UPDATE_TOPIC, UPDATE_TOPIC_CONTENT } from './chapters.store'

const mutations = {
  deleteChapter: [DELETE_CHAPTER],
  deleteTopic: [DELETE_TOPIC],
  rearrangeChapter: [REARRANGE_CHAPTERS],
  rearrangeTopic: [REARRANGE_TOPICS],
  updateChapter: [ADD_CHAPTER, ADD_TOPIC_TO_CHAPTER, ARCHIVE_CHAPTER,
    RESTORE_CHAPTER,
    UPDATE_CHAPTER, UPDATE_CHAPTER_CONTENT, UPDATE_TOPIC_CONTENT],
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

    if (mutations.deleteTopic.includes(type)) {
      ChapterStorageSingleton.deleteTopic(fileId, payload.topic.id)
      return
    }

    if (mutations.rearrangeChapter.includes(type)) {
      ChapterStorageSingleton.arrangeChapters(fileId, payload.chapters.map(chapter => chapter.id))
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

    if (mutations.updateTopic.includes(type)) {
      ChapterStorageSingleton.updateTopic(fileId, payload.topic.id, payload.topic)
      return
    }
  })
}
