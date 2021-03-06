import axiosBase from 'axios'

const axios = axiosBase.create({
  headers: {
    Pragma: 'no-cache',
    'Cache-Control': 'no-store',
  },
})

const route = route => `/api/${route}`

class Api {
  constructor () {
    this.isOnlineCached = null
  }

  isOnline() {
    const promise = this.simpleGet(route('online'))
    promise.then(() => {
      this.isOnlineCached = true
    }, err => {
      if (err.response && err.response.status === 401) {
        setTimeout(() => window.location.reload(), 2000)
      }
      this.isOnlineCached = false
    })
    return promise
  }

  simpleGet(route) {
    return axios.get(route).then(response => response.data)
  }

  simplePost(route, body) {
    return axios.post(route, body).then(response => response.data)
  }

  saveAllContent(data) { return this.simplePost(route('document/saveAll'), data) }

  // DOCUMENTS
  addDocument(doc) { return this.simplePost(route('document/add'), doc) }
  deleteDocument(doc) { return this.simplePost(route('document/delete'), doc) }
  getDocuments() {
    return this.simpleGet(route('documents')).then(documents => documents.map(doc => doc))
  }
  updateDocument(doc) { return this.simplePost(route('document/update'), doc) }

  // CHAPTERS
  arrangeChapters(data) { return this.simplePost(route('chapter/arrange'), data) }
  deleteChapter(data) { return this.simplePost(route('chapter/delete'), data) }
  getChapters(documentGuid) { return this.simpleGet(route(`chapters/${documentGuid}`)) }
  updateChapter(data) { return this.simplePost(route('chapter/update'), data) }

  // TOPICS
  arrangeTopics(data) { return this.simplePost(route('topic/arrange'), data) }
  deleteTopic(data) { return this.simplePost(route('topic/delete'), data) }
  // This returns MasterTopics; ChapterTopics are returned with their associated chapters
  getTopics(documentGuid) { return this.simpleGet(route(`topics/${documentGuid}`)) }
  updateTopic(data) { return this.simplePost(route('topic/update'), data) }

  // PLANS
  arrangePlans(data) { return this.simplePost(route('plan/arrange'), data) }
  deletePlan(data) { return this.simplePost(route('plan/delete'), data) }
  getPlans(documentGuid) { return this.simpleGet(route(`plans/${documentGuid}`)) }
  updatePlan(data) { return this.simplePost(route('plan/update'), data) }

  // SECTIONS
  arrangeSections(data) { return this.simplePost(route('section/arrange'), data) }
  deleteSection(data) { return this.simplePost(route('section/delete'), data) }
  // No get method; sections are returned with their associated plans
  updateSection(data) { return this.simplePost(route('section/update'), data) }

  // WORKSHOPS
  deleteWorkshopContent({ documentGuid, guid }) {
    return this.simplePost(route('workshop-content/delete'), { documentGuid, guid })
  }
  getWorkshops(documentGuid) { return this.simpleGet(route(`workshop-content/${documentGuid}`)) }
  updateWorkshopContents({ documentGuid, workshops }) {
    return this.simplePost(route('workshop-content/update'), { documentGuid, workshops })
  }

  // EXPORT/IMPORT
  docExport(documentGuid) { return this.simpleGet(route(`backup/export/document/${documentGuid}`)) }
  docImport({
    guid, name, chapters, topics, plans, workshops,
  }) {
    return this.simplePost(route('backup/import/document'), {
      guid, name, chapters, topics, plans, workshops,
    })
  }
  fullExport() { return this.simpleGet(route('backup/export')) }
  fullImport(data) { return this.simplePost(route('backup/import'), data) }
  exportToWord({ guid, title, includeArchived }) {
    return new Promise((resolve) => {
      window.open(route(`word/export-chapters?guid=${guid}&title=${title}&includeArchived=${!!includeArchived}`), '_blank')
      resolve()
    })
  }
}

export default new Api()
