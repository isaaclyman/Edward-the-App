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
  }

  addDocument ({ id, name }) {
    return this.wrapStatus(api.addDocument({ id, name }).catch(err => {
      throw err
    }))
  }

  getAllDocuments () {
    return this.wrapStatus(api.getDocuments())
  }

  deleteDocument (id) {
    return this.wrapStatus(api.deleteDocument({ id }))
  }

  updateDocument ({ id, name }) {
    return this.wrapStatus(api.updateDocument({ id, name }))
  }

  deleteChapter (fileId, chapterId) {
    return this.wrapStatus(api.deleteChapter({ fileId, chapterId }))
  }

  deletePlan (fileId, planId) {}

  deleteSection (fileId, planId, sectionId) {}

  deleteTopic (fileId, topicId) {}

  getAllChapters (fileId) {
    return this.wrapStatus(api.getChapters(fileId))
  }

  getAllPlans (fileId) {}

  getAllTopics (fileId) {}

  arrangeChapters (fileId, chapterIds) {
    return this.wrapStatus(api.arrangeChapters({ fileId, chapterIds }))
  }

  arrangePlans (fileId, planIds) {}

  arrangeSections (fileId, planId, sectionIds) {}

  arrangeTopics (fileId, topicIds) {}

  updateChapter (fileId, chapterId, chapter) {
    return this.wrapStatus(api.updateChapter({ fileId, chapterId, chapter }))
  }

  updatePlan (fileId, planId, plan) {}

  updateSection (fileId, planId, sectionId, section) {}

  updateTopic (fileId, topicId, topic) {}

  saveAllContent (fileId, { chapters, plans, topics }) {}
}

export default ServerStorageApi
