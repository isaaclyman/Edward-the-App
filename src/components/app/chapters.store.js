import difference from 'lodash/difference'

// These two commands will be used together
export const NUKE_CONTENT = 'NUKE_CONTENT'
export const LOAD_CONTENT = 'LOAD_CONTENT'

// PLANS have SECTIONS
// CHAPTERS have TOPICS (chapterTopics)
// FILES have TOPICS (masterTopics)
// Each masterTopic has a corresponding chapterTopic in each chapter

export const ADD_PLAN = 'ADD_PLAN'
export const ARCHIVE_PLAN = 'ARCHIVE_PLAN'
export const DELETE_PLAN = 'DELETE_PLAN'
export const REARRANGE_PLANS = 'REARRANGE_PLANS'
export const RESTORE_PLAN = 'RESTORE_PLAN'
export const UPDATE_PLAN = 'UPDATE_PLAN'

export const ADD_SECTION = 'ADD_SECTION'
export const ARCHIVE_SECTION = 'ARCHIVE_SECTION'
export const DELETE_SECTION = 'DELETE_SECTION'
export const REARRANGE_SECTIONS = 'REARRANGE_SECTIONS'
export const RESTORE_SECTION = 'RESTORE_SECTION'
export const UPDATE_SECTION = 'UPDATE_SECTION'
export const UPDATE_SECTION_CONTENT = 'UPDATE_SECTION_CONTENT'
export const UPDATE_SECTION_TAGS = 'UPDATE_SECTION_TAGS'

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

const store = {
  state: {
    // plan [{ archived bool false, id Guid, title string, sections [section] }]
    // section { archived bool false, content Delta null, id Guid, tags [string], title string }
    plans: [],
    // chapters [{ archived bool false, content Delta null, id Guid, title string, topics topicDict {} }]
    // topicDict { [id]: chapterTopic }
    // chapterTopic { content Delta null, id Guid }
    chapters: [],
    // topic [{ archived bool false, id Guid, title string }]
    topics: []
  },
  mutations: {
    // CONTENT
    [NUKE_CONTENT] (state) {
      state.chapters = []
      state.topics = []
    },
    [LOAD_CONTENT] (state, { plans, chapters, topics }) {
      state.plans = plans
      state.chapters = chapters
      state.topics = topics
    },
    // PLANS
    [ADD_PLAN] (state, { plan }) {
      state.plans.push(plan)
    },
    [ARCHIVE_PLAN] (state, { plan }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot archive plan "${plan.title}": does not exist.`)
      }

      plan.archived = true
    },
    [DELETE_PLAN] (state, { plan }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot delete plan "${plan.title}": does not exist.`)
      }

      state.plans.splice(state.plans.indexOf(plan), 1)
    },
    [REARRANGE_PLANS] (state, { plans }) {
      if (!containSameElements(state.plans, plans)) {
        throw new Error(`Cannot rearrange plans: an invalid plan array was received.`)
      }

      state.plans = plans
    },
    [RESTORE_PLAN] (state, { plan }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot restore plan "${plan.title}": does not exist.`)
      }

      plan.archived = false
    },
    [UPDATE_PLAN] (state, { plan, newTitle }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot update plan "${plan.title}": does not exist.`)
      }

      plan.title = newTitle
    },
    // SECTIONS
    [ADD_SECTION] (state, { plan, section }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot mutate plan "${plan.title}": does not exist.`)
      }

      plan.sections.push(section)
    },
    [ARCHIVE_SECTION] (state, { plan, section }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot archive section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot archive section "${section.title}": does not exist.`)
      }

      section.archived = true
    },
    [DELETE_SECTION] (state, { plan, section }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot delete section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot delete section "${section.title}": does not exist.`)
      }

      plan.sections.splice(plan.sections.indexOf(section), 1)
    },
    [REARRANGE_SECTIONS] (state, { plan, sections }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot rearrange sections of plan "${plan.title}": does not exist.`)
      }

      if (!containSameElements(plan.sections, sections)) {
        throw new Error(`Cannot rearrange sections: an invalid section array was received.`)
      }

      plan.sections = sections
    },
    [RESTORE_SECTION] (state, { plan, section }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot restore section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot restore section "${section.title}": does not exist.`)
      }

      section.archived = false
    },
    [UPDATE_SECTION] (state, { plan, section, newTitle }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot update section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot update section "${section.title}": does not exist.`)
      }

      section.title = newTitle
    },
    [UPDATE_SECTION_CONTENT] (state, { plan, section, newContent }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot update section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot update section "${section.title}": does not exist.`)
      }

      section.content = newContent
    },
    [UPDATE_SECTION_TAGS] (state, { plan, section, newTags }) {
      if (!state.plans.includes(plan)) {
        throw new Error(`Cannot update section of plan "${plan.title}": does not exist.`)
      }

      if (!plan.sections.includes(section)) {
        throw new Error(`Cannot update section "${section.title}": does not exist.`)
      }

      section.tags = newTags
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
        id: topic.id
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

      if (!state.topics.find(masterTopic => masterTopic.id === topic.id)) {
        throw new Error(`Cannot update content of topic "${topic.title}": does not exist.`)
      }

      topic.content = newContent
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
