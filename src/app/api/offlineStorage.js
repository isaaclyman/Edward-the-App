import Cache, { UNRESETTABLE } from '../shared/cache'
import clone from 'lodash/clone'
import localForage from 'localforage'
import VueInstance from '../../app'

class OfflineStorageApi {
  constructor (username) {
    this.store = VueInstance.$store

    this.requiresSyncCache = new Cache(`${UNRESETTABLE}_HAS_GONE_OFFLINE`)

    localForage.setDriver([localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE])
    this.storage = localForage
    window._storage = this.storage

    this.offlinePrefix = '@OFFLINE'
    this.docGuid = () => this.store.state.document.currentDocument.guid
    this.docKey = () => `${this.offlinePrefix}_USER_${username}_DOCUMENT_${this.docGuid()}`
  }

  init () {
    this.requiresSyncCache.cacheSet(true)
    return this.clearOldStorage().then(() => this.updateStorage())
  }

  isPremium () {
    return true
  }

  getLatestStoredDocument () {
    return this.storage.keys().then(keys => {
      const docKey = keys.filter(key => key.startsWith(this.offlinePrefix))[0]
      if (!docKey) {
        return null
      }
      return this.storage.getItem(docKey)
    })
  }

  getStoredDocument () {
    return this.storage.getItem(this.docKey())
  }

  clearOldStorage () {
    return this.storage.keys().then(keys => {
      const deletePromises = keys.filter(key => key.startsWith(this.offlinePrefix)).map(key => this.storage.removeItem(key))
      return Promise.all(deletePromises)
    })
  }

  updateStorage () {
    const doc = clone(this.store.state.document.currentDocument)

    if (!doc) {
      console.warn('Document not yet loaded.')
      return
    }

    doc.chapters = this.store.state.chapters.chapters
    doc.topics = this.store.state.chapters.topics
    doc.plans = this.store.state.chapters.plans
    doc.workshops = this.store.state.workshop.workshops
    return this.storage.setItem(this.docKey(), doc)
  }

  notAllowedError () {
    throw new Error('This action is not available while offline.')
  }

  // Disallowed operations

  addDocument () { return this.notAllowedError() }

  deleteDocument () { return this.notAllowedError() }

  // Storage updates

  arrangeChapters () { return this.updateStorage() }

  arrangePlans () { return this.updateStorage() }

  arrangeSections () { return this.updateStorage() }

  arrangeTopics () { return this.updateStorage() }

  deleteChapter () { return this.updateStorage() }

  deletePlan () { return this.updateStorage() }

  deleteSection () { return this.updateStorage() }

  deleteTopic () { return this.updateStorage() }

  deleteWorkshop () { return this.updateStorage() }

  saveAllContent () { return this.updateStorage() }

  updateChapter () { return this.updateStorage() }

  updateDocument () { return this.updateStorage() }

  updatePlan () { return this.updateStorage() }

  updateSection () { return this.updateStorage() }

  updateTopic () { return this.updateStorage() }

  updateWorkshops () { return this.updateStorage() }

  getAllChapters (documentGuid) {
    if (documentGuid !== this.docGuid()) {
      throw new Error('Cannot get chapters from a different document while offline.')
    }

    return this.getStoredDocument().then(doc => doc.chapters)
  }

  getAllDocuments () {
    return this.getLatestStoredDocument().then(doc => (doc ? [doc] : []))
  }

  getAllPlans (documentGuid) {
    if (documentGuid !== this.docGuid()) {
      throw new Error('Cannot get plans from a different document while offline.')
    }

    return this.getStoredDocument().then(doc => doc.plans)
  }

  getAllTopics (documentGuid) {
    if (documentGuid !== this.docGuid()) {
      throw new Error('Cannot get topics from a different document while offline.')
    }

    return this.getStoredDocument().then(doc => doc.topics)
  }

  getAllWorkshops (documentGuid) {
    if (documentGuid !== this.docGuid()) {
      throw new Error('Cannot get workshops from a different document while offline.')
    }

    return this.getStoredDocument().then(doc => doc.workshops)
  }

  /*
    FULL EXPORT / IMPORT
  */

  docExport (guid) {
    if (guid !== this.docGuid()) {
      throw new Error('Cannot export a different document while offline.')
    }

    return this.getStoredDocument()
  }

  docImport () {
    throw new Error('Cannot import a document while offline.')
  }

  getFullExport () {
    throw new Error('Cannot export all documents while offline.')
  }

  doFullImport () {
    throw new Error('Cannot do a full import while offline.')
  }
}

export default OfflineStorageApi
