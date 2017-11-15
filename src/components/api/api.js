import axios from 'axios'

const route = route => `/api/${route}`

class Api {
  simpleGet (route) {
    return new Promise((resolve, reject) => {
      axios.get(route).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  }
  simplePost (route, body) {
    return new Promise((resolve, reject) => {
      axios.post(route, body).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  }

  // DOCUMENTS
  addDocument (doc) { return this.simplePost(route('document/add'), doc) }
  deleteDocument (doc) { return this.simplePost(route('document/delete'), doc) }
  getDocuments () {
    return this.simpleGet(route('documents')).then(documents => {
      return documents.map(doc => {
        doc.id = doc.guid
        return doc
      })
    })
  }
  updateDocument (doc) { return this.simplePost(route('document/update'), doc) }

  // CHAPTERS
  arrangeChapters (data) { return this.simplePost(route('chapter/arrange'), data) }
  deleteChapter (data) { return this.simplePost(route('chapter/delete'), data) }
  getChapters (fileId) {
    return this.simpleGet(route(`chapters/${fileId}`)).then(chapters => {
      return chapters.map(chapter => {
        chapter.id = chapter.guid
        Object.keys(chapter.topics).forEach(id => {
          const topic = chapter.topics[id]
          topic.id = topic.guid
        })
        return chapter
      })
    })
  }
  updateChapter (data) { return this.simplePost(route('chapter/update'), data) }

  // TOPICS
  arrangeTopics (data) { return this.simplePost(route('topic/arrange'), data) }
  deleteTopic (data) { return this.simplePost(route('topic/delete'), data) }
  // This returns MasterTopics; ChapterTopics are returned with their associated chapters
  getTopics (fileId) {
    return this.simpleGet(route(`topics/${fileId}`)).then(topics => {
      return topics.map(topic => {
        topic.id = topic.guid
        return topic
      })
    })
  }
  updateTopic (data) { return this.simplePost(route('topic/update'), data) }

  // PLANS
  arrangePlans (data) { return this.simplePost(route('plan/arrange'), data) }
  deletePlan (data) { return this.simplePost(route('plan/delete'), data) }
  getPlans (fileId) {
    return this.simpleGet(route(`plans/${fileId}`)).then(plans => {
      return plans.map(plan => {
        plan.id = plan.guid
        plan.sections = plan.sections.map(section => {
          section.id = section.guid
          return section
        })
        return plan
      })
    })
  }
  updatePlan (data) { return this.simplePost(route('plan/update'), data) }

  // SECTIONS
  arrangeSections (data) { return this.simplePost(route('section/arrange'), data) }
  deleteSection (data) { return this.simplePost(route('section/delete'), data) }
  // No get method; sections are returned with their associated plans
  updateSection (data) { return this.simplePost(route('section/update'), data) }
}

export default new Api()
