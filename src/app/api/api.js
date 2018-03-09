import axios from 'axios'

const route = route => `/api/${route}`

class Api {
  simpleGet (route) {
    return axios.get(route).then(response => {
      return response.data
    })
  }
  simplePost (route, body) {
    return axios.post(route, body).then(response => {
      return response.data
    })
  }

  saveAllContent (data) { return this.simplePost(route('document/saveAll'), data) }

  // DOCUMENTS
  addDocument (doc) { return this.simplePost(route('document/add'), doc) }
  deleteDocument (doc) { return this.simplePost(route('document/delete'), doc) }
  getDocuments () {
    return this.simpleGet(route('documents')).then(documents => {
      return documents.map(doc => {
        return doc
      })
    })
  }
  updateDocument (doc) { return this.simplePost(route('document/update'), doc) }

  // CHAPTERS
  arrangeChapters (data) { return this.simplePost(route('chapter/arrange'), data) }
  deleteChapter (data) { return this.simplePost(route('chapter/delete'), data) }
  getChapters (documentGuid) { return this.simpleGet(route(`chapters/${documentGuid}`)) }
  updateChapter (data) { return this.simplePost(route('chapter/update'), data) }

  // TOPICS
  arrangeTopics (data) { return this.simplePost(route('topic/arrange'), data) }
  deleteTopic (data) { return this.simplePost(route('topic/delete'), data) }
  // This returns MasterTopics; ChapterTopics are returned with their associated chapters
  getTopics (documentGuid) { return this.simpleGet(route(`topics/${documentGuid}`)) }
  updateTopic (data) { return this.simplePost(route('topic/update'), data) }

  // PLANS
  arrangePlans (data) { return this.simplePost(route('plan/arrange'), data) }
  deletePlan (data) { return this.simplePost(route('plan/delete'), data) }
  getPlans (documentGuid) { return this.simpleGet(route(`plans/${documentGuid}`)) }
  updatePlan (data) { return this.simplePost(route('plan/update'), data) }

  // SECTIONS
  arrangeSections (data) { return this.simplePost(route('section/arrange'), data) }
  deleteSection (data) { return this.simplePost(route('section/delete'), data) }
  // No get method; sections are returned with their associated plans
  updateSection (data) { return this.simplePost(route('section/update'), data) }

  // WORKSHOPS
  deleteWorkshopContent ({ documentGuid, guid }) {
    return this.simplePost(route('workshop-content/delete'), { documentGuid, guid })
  }
  getWorkshopContentList (documentGuid) { return this.simpleGet(route(`workshop-content/list/${documentGuid}`)) }
  getWorkshopContentByGuids ({ documentGuid, workshopName, guids }) {
    return this.simplePost(route('workshop-content/by-guids'), { documentGuid, workshopName, guids })
  }
  updateWorkshopContents ({ documentGuid, workshops }) {
    return this.simplePost(route('workshop-content/update'), { documentGuid, workshops })
  }

  // FULL EXPORT/IMPORT
  fullExport () { return this.simpleGet(route('backup/export')) }
  fullImport (data) { return this.simplePost(route('backup/import'), data) }
}

export default new Api()
