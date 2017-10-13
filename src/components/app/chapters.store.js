import difference from 'lodash/difference'

// These two commands will be used together
export const NUKE_CONTENT = 'NUKE_CONTENT'
export const LOAD_CONTENT = 'LOAD_CONTENT'

export const ADD_CHAPTER = 'ADD_CHAPTER'
export const ADD_TOPIC_TO_CHAPTER = 'ADD_TOPIC_TO_CHAPTER'
export const ARCHIVE_CHAPTER = 'ARCHIVE_CHAPTER'
export const DELETE_CHAPTER = 'DELETE_CHAPTER'
export const REARRANGE_CHAPTERS = 'REARRANGE_CHAPTERS'
export const RESTORE_CHAPTER = 'RESTORE_CHAPTER'
export const UPDATE_CHAPTER = 'UPDATE_CHAPTER'
export const UPDATE_CHAPTER_CONTENT = 'UPDATE_CHAPTER_CONTENT'

export const ADD_TOPIC = 'ADD_TOPIC'
export const ARCHIVE_TOPIC = 'ARCHIVE_TOPIC'
export const DELETE_TOPIC = 'DELETE_TOPIC'
export const REARRANGE_TOPICS = 'REARRANGE_TOPICS'
export const RESTORE_TOPIC = 'RESTORE_TOPIC'
export const UPDATE_TOPIC = 'UPDATE_TOPIC'
export const UPDATE_TOPIC_CONTENT = 'UPDATE_TOPIC_CONTENT'
export const UPDATE_TOPIC_TEXT_CONTENT = 'UPDATE_TOPIC_TEXT_CONTENT'

const store = {
  state: {
    // chapters [{ archived bool false, content Delta null, id Guid, title string, topics topicDict {} }]
    // topicDict { [id]: chapterTopic }
    // chapterTopic { content Delta null, id Guid, textContent string '' }
    chapters: [],
    topics: []    // topic [{ archived bool false, id Guid, title string }]
  },
  mutations: {
    // CONTENT
    [NUKE_CONTENT] (state) {
      state.chapters = []
      state.topics = []
    },
    [LOAD_CONTENT] (state, { chapters, topics }) {
      state.chapters = chapters
      state.topics = topics
    },
    // CHAPTERS
    [ADD_CHAPTER] (state, { chapter }) {
      state.chapters.push(chapter)
    },
    [ADD_TOPIC_TO_CHAPTER] (state, { chapter, topic }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot mutate chapter "${chapter.title}": does not exist.`)
      }

      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot include topic "${topic.title}": does not exist.`)
      }

      chapter.topics[topic.id] = {
        content: null,
        id: topic.id,
        textContent: ''
      }
    },
    [ARCHIVE_CHAPTER] (state, { chapter }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot archive chapter "${chapter.title}": does not exist.`)
      }

      chapter.archived = true
    },
    [DELETE_CHAPTER] (state, { chapter }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot delete chapter "${chapter.title}": does not exist.`)
      }

      state.chapters.splice(state.chapters.indexOf(chapter), 1)
    },
    [REARRANGE_CHAPTERS] (state, { chapters }) {
      if (!containSameElements(state.chapters, chapters)) {
        throw new Error('Cannot rearrange chapters: an invalid chapter array was received.')
      }

      state.chapters = chapters
    },
    [RESTORE_CHAPTER] (state, { chapter }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot restore chapter "${chapter.title}": does not exist.`)
      }

      chapter.archived = false
    },
    [UPDATE_CHAPTER] (state, { chapter, newTitle }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot update chapter "${chapter.title}": does not exist.`)
      }

      chapter.title = newTitle
    },
    [UPDATE_CHAPTER_CONTENT] (state, { chapter, newContent }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot update content of chapter "${chapter.title}": does not exist.`)
      }

      chapter.content = newContent
    },
    // TOPICS
    [ADD_TOPIC] (state, { topic }) {
      state.topics.push(topic)
    },
    [ARCHIVE_TOPIC] (state, { topic }) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot archive topic "${topic.title}": does not exist.`)
      }

      topic.archived = true
    },
    [DELETE_TOPIC] (state, { topic }) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot archive topic "${topic.title}": does not exist.`)
      }

      state.topics.splice(state.topics.indexOf(topic), 1)

      state.chapters = state.chapters.map(chapter => {
        if (chapter.topics[topic.id]) {
          delete chapter.topics[topic.id]
        }

        return chapter
      })
    },
    [REARRANGE_TOPICS] (state, { topics }) {
      if (!containSameElements(state.topics, topics)) {
        throw new Error('Cannot rearrange topics: an invalid topic array was received.')
      }

      state.topics = topics
    },
    [RESTORE_TOPIC] (state, { topic }) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot restore topic "${topic.title}": does not exist.`)
      }

      topic.archived = false
    },
    [UPDATE_TOPIC] (state, { topic, newTitle }) {
      if (!state.topics.includes(topic)) {
        throw new Error(`Cannot update topic "${topic.title}": does not exist.`)
      }

      topic.title = newTitle
    },
    [UPDATE_TOPIC_CONTENT] (state, { chapter, topic, newContent }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot update topic content for chapter "${chapter.title}": does not exist.`)
      }

      if (!state.topics.find(masterTopic => masterTopic.title === topic.title)) {
        throw new Error(`Cannot update content of topic "${topic.title}": does not exist.`)
      }

      topic.content = newContent
    },
    [UPDATE_TOPIC_TEXT_CONTENT] (state, { chapter, topic, newTextContent }) {
      if (!state.chapters.includes(chapter)) {
        throw new Error(`Cannot update topic text content for chapter "${chapter.title}": does not exist.`)
      }

      if (!state.topics.find(masterTopic => masterTopic.title === topic.title)) {
        throw new Error(`Cannot update text content of topic "${topic.title}": does not exist.`)
      }

      topic.textContent = newTextContent
    }
  }
}

function containSameElements (arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false
  }

  if (arr1.length !== arr2.length) {
    return false
  }

  const diff = [...difference(arr1, arr2), ...difference(arr2, arr1)]

  return diff.length === 0
}

export default store
