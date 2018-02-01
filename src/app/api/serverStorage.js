import api from './api'
import VueInstance from '../../main'
import { CLEAR_ERROR, SET_STATUS_DONE, SET_STATUS_ERROR, SET_STATUS_SAVING } from '../shared/status.store'

class ServerStorageApi {
  constructor () {
    let savingCounter = 0
    const store = VueInstance.$store

    const saving = () => {
      savingCounter++
      store.commit(CLEAR_ERROR)
      store.commit(SET_STATUS_SAVING)
    }
    const done = (isError) => {
      savingCounter--
      if (savingCounter > 0) {
        return
      }
      savingCounter = 0

      if (isError) {
        store.commit(SET_STATUS_ERROR)
      } else {
        store.commit(SET_STATUS_DONE)
      }
    }
    this.wrapStatus = promise => {
      saving()
      promise.then(() => done(), () => done(true))
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

  saveAllContent (documentGuid, { chapters, plans, topics }) {
    return this.waitUntilDone().then(() => {
      return this.wrapStatus(api.saveAllContent({ documentGuid, chapters, plans, topics }))
    })
  }

  // FULL EXPORT/IMPORT

  fullExport () {
    return api.fullExport()
  }

  fullImport (json) {
    const data = JSON.parse(json)
    return api.fullImport(data)
  }
}

export default ServerStorageApi
