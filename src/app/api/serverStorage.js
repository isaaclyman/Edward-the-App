import api from './api'
import OfflineStorageApi from './offlineStorage'
import shallowEqualArrays from 'shallow-equal/arrays'
import VersionResolver from '../shared/versionResolver'
import VueInstance from '../../app'
import { SET_STATUS_DONE, SET_STATUS_ERROR, SET_STATUS_OFFLINE, SET_STATUS_SAVING } from '../shared/status.store'
import { LOAD_CONTENT } from '../shared/chapters.store'
import { LOAD_WORKSHOPS } from '../shared/workshops.store'

class ServerStorageApi {
  constructor () {
    let savingCounter = 0
    const store = VueInstance.$store

    this.offlineStorage = new OfflineStorageApi()

    const saving = () => {
      savingCounter++
      store.commit(SET_STATUS_SAVING)
      this.offlineStorage.updateStorage()
    }

    const done = (isError, isOffline) => {
      savingCounter--
      if (savingCounter > 0) {
        return
      }
      savingCounter = 0

      if (!isError) {
        store.commit(SET_STATUS_DONE)
        return
      }

      if (isOffline) {
        store.commit(SET_STATUS_OFFLINE)
        return
      }

      store.commit(SET_STATUS_ERROR)
      return
    }

    this.wrapStatus = promise => {
      saving()
      promise.then(
        () => done(false),
        () => {
          api.isOnline().then(() => done(true, false), () => done(true, true))
        }
      )
      return promise
    }

    this.waitUntilDone = () => {
      return new Promise((resolve, reject) => {
        let counter = 0

        const intervalId = window.setInterval(() => {
          // Reject after waiting 10 seconds
          if ((counter / 10) > 10) {
            reject()
            return
          }

          if (store.state.status.saving) {
            counter++
            return
          }

          window.clearInterval(intervalId)
          resolve()
        }, 100)
      })
    }

    this.loadDocument = document => {
      store.commit(LOAD_CONTENT, {
        chapters: document.chapters || [],
        plans: document.plans || [],
        topics: document.topics || []
      })
      store.commit(LOAD_WORKSHOPS, { workshops: document.workshops || [] })
    }

    api.isOnline().then(() => {}, () => {
      store.commit(SET_STATUS_OFFLINE)
    })
  }

  init () {
    return this.offlineStorage.getLatestStoredDocument().then(offlineDoc => {
      if (!offlineDoc || !offlineDoc.guid) {
        return
      }

      let resolvedDoc
      return api.docExport(offlineDoc.guid).then(onlineDoc => {
        const matchBy = obj => obj && obj.guid
        const markDeleted = obj => {
          if (!obj) return
          obj.title = `${obj.title} [RESTORED]`
        }

        const resolvedChapters = VersionResolver.getMostRecentEach(onlineDoc.chapters, offlineDoc.chapters, matchBy, markDeleted)
        const resolvedTopics = VersionResolver.getMostRecentEach(onlineDoc.topics, offlineDoc.topics, matchBy, markDeleted)
        const resolvedPlans = VersionResolver.getMostRecentEach(onlineDoc.plans, offlineDoc.plans, matchBy, markDeleted)
        const resolvedWorkshops = VersionResolver.getMostRecentEach(onlineDoc.workshops, offlineDoc.workshops,
          workshop => workshop && workshop.guid ? `${workshop.guid}|${workshop.order}` : null, markDeleted)

        const newDoc = {
          name: offlineDoc.name,
          chapters: resolvedChapters,
          topics: resolvedTopics,
          plans: resolvedPlans,
          workshops: resolvedWorkshops
        }

        if (
          offlineDoc.name === onlineDoc.name &&
          shallowEqualArrays(resolvedChapters, onlineDoc.chapters) &&
          shallowEqualArrays(resolvedTopics, onlineDoc.topics) &&
          shallowEqualArrays(resolvedPlans, onlineDoc.plans) &&
          shallowEqualArrays(resolvedWorkshops, onlineDoc.workshops)
        ) {
          return
        }

        resolvedDoc = Object.assign(onlineDoc, newDoc)
        return this.docImport(resolvedDoc)
      }, () => {
        resolvedDoc = offlineDoc
        return this.docImport(offlineDoc)
      }).then(
        () => this.offlineStorage.clearOldStorage()
      ).then(() => {
        this.loadDocument(resolvedDoc)
      })
    }).then(() => {
      return this.offlineStorage.init()
    })
  }

  // INFO

  isPremium () {
    return true
  }

  // DOCUMENTS

  addDocument ({ guid, name }) {
    return this.wrapStatus(api.addDocument({ guid, name }).catch(err => {
      throw err
    }))
  }

  getAllDocuments () {
    return api.getDocuments()
  }

  deleteDocument (guid) {
    return this.wrapStatus(api.deleteDocument({ guid }))
  }

  updateDocument ({ guid, name }) {
    return this.wrapStatus(api.updateDocument({ guid, name }))
  }

  // ARRANGE

  arrangeChapters (documentGuid, chapterGuids) {
    return this.wrapStatus(api.arrangeChapters({ documentGuid, chapterGuids }))
  }

  arrangePlans (documentGuid, planGuids) {
    return this.wrapStatus(api.arrangePlans({ documentGuid, planGuids }))
  }

  arrangeSections (documentGuid, planGuid, sectionGuids) {
    return this.wrapStatus(api.arrangeSections({ documentGuid, planGuid, sectionGuids }))
  }

  arrangeTopics (documentGuid, topicGuids) {
    return this.wrapStatus(api.arrangeTopics({ documentGuid, topicGuids }))
  }

  // DELETE

  deleteChapter (documentGuid, chapterGuid) {
    return this.wrapStatus(api.deleteChapter({ documentGuid, chapterGuid }))
  }

  deletePlan (documentGuid, planGuid) {
    return this.wrapStatus(api.deletePlan({ documentGuid, planGuid }))
  }

  deleteSection (documentGuid, planGuid, sectionGuid) {
    return this.wrapStatus(api.deleteSection({ documentGuid, planGuid, sectionGuid }))
  }

  deleteTopic (documentGuid, topicGuid) {
    return this.wrapStatus(api.deleteTopic({ documentGuid, topicGuid }))
  }

  deleteWorkshop (documentGuid, workshopGuid) {
    return this.wrapStatus(api.deleteWorkshopContent({ documentGuid, guid: workshopGuid }))
  }

  // GET

  getAllChapters (documentGuid) {
    return api.getChapters(documentGuid)
  }

  getAllPlans (documentGuid) {
    return api.getPlans(documentGuid)
  }

  getAllTopics (documentGuid) {
    return api.getTopics(documentGuid)
  }

  getWorkshops (documentGuid) {
    return api.getWorkshops(documentGuid)
  }

  // UPDATE

  updateChapter (documentGuid, chapterGuid, chapter) {
    return this.wrapStatus(api.updateChapter({ documentGuid, chapterGuid, chapter }))
  }

  updatePlan (documentGuid, planGuid, plan) {
    return this.wrapStatus(api.updatePlan({ documentGuid, planGuid, plan }))
  }

  updateSection (documentGuid, planGuid, sectionGuid, section) {
    return this.wrapStatus(api.updateSection({ documentGuid, planGuid, sectionGuid, section }))
  }

  updateTopic (documentGuid, topicGuid, topic) {
    return this.wrapStatus(api.updateTopic({ documentGuid, topicGuid, topic }))
  }

  updateWorkshops (documentGuid, workshops) {
    return this.wrapStatus(api.updateWorkshopContents({ documentGuid, workshops }))
  }

  saveAllContent (documentGuid, { chapters, plans, topics }) {
    return this.waitUntilDone().then(() => {
      return this.wrapStatus(api.saveAllContent({ documentGuid, chapters, plans, topics }))
    })
  }

  // EXPORT/IMPORT

  docExport (documentGuid) {
    return api.docExport(documentGuid)
  }

  docImport (doc) {
    return api.docImport(doc)
  }

  fullExport () {
    return api.fullExport().then(data => JSON.stringify(data))
  }

  fullImport (json) {
    const data = JSON.parse(json)
    return api.fullImport(data)
  }

  exportToWord ({ guid, title, includeArchived }) {
    return api.exportToWord({ guid, title, includeArchived })
  }
}

export default ServerStorageApi
