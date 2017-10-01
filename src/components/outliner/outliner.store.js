export const ADD_CHAPTER = 'ADD_CHAPTER'
export const ADD_TOPIC_TO_CHAPTER = 'ADD_TOPIC_TO_CHAPTER'
export const ARCHIVE_CHAPTER = 'ARCHIVE_CHAPTER'
export const DELETE_CHAPTER = 'DELETE_CHAPTER'
export const RESTORE_CHAPTER = 'RESTORE_CHAPTER'
export const UPDATE_CHAPTER = 'UPDATE_CHAPTER'

export const ADD_TOPIC = 'ADD_TOPIC'
export const ARCHIVE_TOPIC = 'ARCHIVE_TOPIC'
export const DELETE_TOPIC = 'DELETE_TOPIC'
export const RESTORE_TOPIC = 'RESTORE_TOPIC'
export const UPDATE_TOPIC = 'UPDATE_TOPIC'

const store = {
  state: {
    chapters: [{
      archived: false,
      title: 'Chapter 1',
      topics: {}  // [{ content Delta, textContent '' (computed from content), title '' }]
    }],
    topics: []    // [{ archived false, title '' }]
  },
  mutations: {
    // CHAPTERS
    [ADD_CHAPTER] (state, chapter) {
      state.chapters.push(chapter)
    },
    [ADD_TOPIC_TO_CHAPTER] (state, { chapter, topic }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot mutate chapter "${chapter.title}": does not exist.`)
      }

      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot include topic "${topic.title}": does not exist.`)
      }

      chapter.topics[topic.title] = {
        content: null,
        textContent: '',
        title: topic.title
      }
    },
    [ARCHIVE_CHAPTER] (state, chapter) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot archive chapter "${chapter.title}": does not exist.`)
      }

      chapter.archived = true
    },
    [DELETE_CHAPTER] (state, chapter) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot delete chapter "${chapter.title}": does not exist.`)
      }

      state.chapters.splice(state.chapters.indexOf(chapter), 1)
    },
    [RESTORE_CHAPTER] (state, chapter) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot restore chapter "${chapter.title}": does not exist.`)
      }

      chapter.archived = false
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
    [DELETE_TOPIC] (state, topic) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot archive topic "${topic.title}": does not exist.`)
      }

      state.topics.splice(state.topics.indexOf(topic), 1)

      state.chapters = state.chapters.map(chapter => {
        if (chapter[topic.title]) {
          delete chapter[topic.title]
        }

        return chapter
      })
    },
    [RESTORE_TOPIC] (state, topic) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot restore topic "${topic.title}": does not exist.`)
      }

      topic.archived = false
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
