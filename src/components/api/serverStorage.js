import api from './api'
import VueInstance from '../../main'
import { CLEAR_ERROR, SET_STATUS_DONE, SET_STATUS_ERROR, SET_STATUS_SAVING } from '../app/status.store'

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

  addDocument ({ id, name }) {
    return this.wrapStatus(api.addDocument({ id, name }).catch(err => {
      throw err
    }))
  }

  getAllDocuments () {
    return api.getDocuments()
  }

  deleteDocument (id) {
    return this.wrapStatus(api.deleteDocument({ id }))
  }

  updateDocument ({ id, name }) {
    return this.wrapStatus(api.updateDocument({ id, name }))
  }

  // ARRANGE

  arrangeChapters (fileId, chapterIds) {
    return this.wrapStatus(api.arrangeChapters({ fileId, chapterIds }))
  }

  arrangePlans (fileId, planIds) {
    return this.wrapStatus(api.arrangePlans({ fileId, planIds }))
  }

  arrangeSections (fileId, planId, sectionIds) {
    return this.wrapStatus(api.arrangeSections({ fileId, planId, sectionIds }))
  }

  arrangeTopics (fileId, topicIds) {
    return this.wrapStatus(api.arrangeTopics({ fileId, topicIds }))
  }

  // DELETE

  deleteChapter (fileId, chapterId) {
    return this.wrapStatus(api.deleteChapter({ fileId, chapterId }))
  }

  deletePlan (fileId, planId) {
    return this.wrapStatus(api.deletePlan({ fileId, planId }))
  }

  deleteSection (fileId, planId, sectionId) {
    return this.wrapStatus(api.deleteSection({ fileId, planId, sectionId }))
  }

  deleteTopic (fileId, topicId) {
    return this.wrapStatus(api.deleteTopic({ fileId, topicId }))
  }

  // GET

  getAllChapters (fileId) {
    return api.getChapters(fileId)
  }

  getAllPlans (fileId) {
    return api.getPlans(fileId)
  }

  getAllTopics (fileId) {
    return api.getTopics(fileId)
  }

  // UPDATE

  updateChapter (fileId, chapterId, chapter) {
    return this.wrapStatus(api.updateChapter({ fileId, chapterId, chapter }))
  }

  updatePlan (fileId, planId, plan) {
    return this.wrapStatus(api.updatePlan({ fileId, planId, plan }))
  }

  updateSection (fileId, planId, sectionId, section) {
    return this.wrapStatus(api.updateSection({ fileId, planId, sectionId, section }))
  }

  updateTopic (fileId, topicId, topic) {
    return this.wrapStatus(api.updateTopic({ fileId, topicId, topic }))
  }

  saveAllContent (fileId, { chapters, plans, topics }) {
    return this.waitUntilDone().then(() => {
      return this.wrapStatus(api.saveAllContent({ fileId, chapters, plans, topics }))
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
