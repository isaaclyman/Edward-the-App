import api from './api'

class ServerStorageApi {
  addDocument ({ id, name }) {
    return api.addDocument({ id, name }).catch(err => {
      throw err
    })
  }

  getAllDocuments () {
    return api.getDocuments()
  }

  deleteDocument (id) {
    return api.deleteDocument({ id })
  }

  updateDocument ({ id, name }) {
    return api.updateDocument({ id, name })
  }

  deleteChapter (fileId, chapterId) {
    return api.deleteChapter({ fileId, chapterId })
  }

  deletePlan (fileId, planId) {}

  deleteSection (fileId, planId, sectionId) {}

  deleteTopic (fileId, topicId) {}

  getAllChapters (fileId) {
    return api.getChapters(fileId)
  }

  getAllPlans (fileId) {}

  getAllTopics (fileId) {}

  arrangeChapters (fileId, chapterIds) {
    return api.arrangeChapters({ fileId, chapterIds })
  }

  arrangePlans (fileId, planIds) {}

  arrangeSections (fileId, planId, sectionIds) {}

  arrangeTopics (fileId, topicIds) {}

  updateChapter (fileId, chapterId, chapter) {
    return api.updateChapter({ fileId, chapterId, chapter })
  }

  updatePlan (fileId, planId, plan) {}

  updateSection (fileId, planId, sectionId, section) {}

  updateTopic (fileId, topicId, topic) {}

  saveAllContent (fileId, { chapters, plans, topics }) {}
}

export default ServerStorageApi
