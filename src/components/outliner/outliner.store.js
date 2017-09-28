export const ADD_CHAPTER = 'ADD_CHAPTER'
export const ARCHIVE_CHAPTER = 'DELETE_CHAPTER'
export const UPDATE_CHAPTER = 'UPDATE_CHAPTER'

export const ADD_TOPIC = 'ADD_TOPIC'
export const ARCHIVE_TOPIC = 'DELETE_CHAPTER'
export const UPDATE_TOPIC = 'UPDATE_TOPIC'

import find from 'lodash/find'
import findIndex from 'lodash/findIndex'

const store = {
  state: {
    chapters: [{
      archived: false,
      title: 'Chapter 1',
      topics: []
    }],
    topics: []    // [{ title '', content Delta, archived false }]
  },
  mutations: {
    // CHAPTERS
    [ADD_CHAPTER] (state, chapter) {
      state.chapters.push(chapter)
    },
    [ARCHIVE_CHAPTER] (state, chapter) {
      const chapterToArchive = find(state.chapters, current => current.title === chapter.title)
      chapterToArchive.archived = true
    },
    [UPDATE_CHAPTER] (state, oldTitle, chapter) {
      const chapterToUpdate = findIndex(state.chapters, current => current.title === oldTitle)
      state.chapters.splice(chapterToUpdate, 1, chapter)
    },
    // TOPICS
    [ADD_TOPIC] (state, topic) {
      state.topics.push(topic)
    },
    [ARCHIVE_TOPIC] (state, topic) {
      const topicToArchive = find(state.topics, current => current.title === topic.title)
      topicToArchive.archived = true
    },
    [UPDATE_TOPIC] (state, oldTitle, topic) {
      const topicToUpdate = findIndex(state.topics, current => current.title === oldTitle)
      state.topics.splice(topicToUpdate, 1, topic)
    }
  }
}

export default store
