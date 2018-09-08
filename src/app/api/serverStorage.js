import api from './api'
import OfflineStorageApi from './offlineStorage'
import VersionResolver from '../shared/versionResolver'
import VueInstance from '../../main'
import { SET_STATUS_DONE, SET_STATUS_ERROR, SET_STATUS_OFFLINE, SET_STATUS_SAVING } from '../shared/status.store'
import { LOAD_CONTENT } from '../shared/chapters.store'
import { LOAD_WORKSHOPS } from '../shared/workshops.store'

class ServerStorageApi {
  constructor () {
    let savingCounter = 0
    const store = VueInstance.$store

    const saving = () => {
      savingCounter++
      store.commit(SET_STATUS_SAVING)
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
    const offlineStorage = new OfflineStorageApi()
    return offlineStorage.getLatestStoredDocument().then(offlineDoc => {
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
        onlineDoc.name = offlineDoc.name
        onlineDoc.chapters = VersionResolver.getMostRecentEach(onlineDoc.chapters, offlineDoc.chapters, matchBy, markDeleted)
        onlineDoc.topics = VersionResolver.getMostRecentEach(onlineDoc.topics, offlineDoc.topics, matchBy, markDeleted)
        onlineDoc.plans = VersionResolver.getMostRecentEach(onlineDoc.plans, offlineDoc.plans, matchBy, markDeleted)
        onlineDoc.workshops = VersionResolver.getMostRecentEach(onlineDoc.workshops, offlineDoc.workshops,
          workshop => workshop && workshop.guid ? `${workshop.guid}|${workshop.order}` : null, markDeleted)
        resolvedDoc = onlineDoc
        return this.docImport(onlineDoc)
      }, () => {
        resolvedDoc = offlineDoc
        return this.docImport(offlineDoc)
      }).then(
        () => offlineStorage.clearOldStorage()
      ).then(() => {
        this.loadDocument(resolvedDoc)
      })
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
