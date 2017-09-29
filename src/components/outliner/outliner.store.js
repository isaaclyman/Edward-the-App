export const ADD_CHAPTER = 'ADD_CHAPTER'
export const ARCHIVE_CHAPTER = 'DELETE_CHAPTER'
export const UPDATE_CHAPTER = 'UPDATE_CHAPTER'

export const ADD_TOPIC = 'ADD_TOPIC'
export const ARCHIVE_TOPIC = 'DELETE_TOPIC'
export const UPDATE_TOPIC = 'UPDATE_TOPIC'

const store = {
  state: {
    chapters: [{
      archived: false,
      title: 'Chapter 1',
      topics: []
    }],
    topics: []    // [{ archived false, content Delta, textContent '' (computed from content), title '' }]
  },
  mutations: {
    // CHAPTERS
    [ADD_CHAPTER] (state, chapter) {
      state.chapters.push(chapter)
    },
    [ARCHIVE_CHAPTER] (state, chapter) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot archive chapter "${chapter.title}": does not exist.`)
      }

      chapter.archived = true
    },
    [UPDATE_CHAPTER] (state, chapter, newTitle) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot update chapter "${chapter.title}": does not exist.`)
      }

      chapter.title = newTitle
    },
    // TOPICS
    [ADD_TOPIC] (state, topic) {
      state.topics.push(topic)
    },
    [ARCHIVE_TOPIC] (state, topic) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot archive topic "${topic.title}": does not exist.`)
      }

      topic.archived = true
    },
    [UPDATE_TOPIC] (state, topic, newTitle, newContent) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot update topic "${topic.title}": does not exist.`)
      }

      topic.title = newTitle
      topic.content = newContent
    }
  }
}

export default store
