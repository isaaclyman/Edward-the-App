import ChapterStorage from './chapters.persist'
import { LOAD_CONTENT, NUKE_CONTENT } from './chapters.store'

export const ADD_FILE = 'ADD_FILE'
export const CHANGE_FILE = 'CHANGE_FILE'
export const INIT_FILES = 'INIT_FILES'
const LOAD_FILES = 'LOAD_FILES'
const UPDATE_FILE_METADATA = 'UPDATE_FILE_METADATA'

const store = {
  state: {
    currentFile: null, // file { id String, name String }
    ownedFiles: [] // file[]
  },
  actions: {
    [CHANGE_FILE] ({ commit }, { id, name }) {
      commit(UPDATE_FILE_METADATA, { id: null, name: null })
      commit(NUKE_CONTENT)

      const chapters = ChapterStorage.getAllChapters(id)
      const topics = ChapterStorage.getAllTopics(id)

      commit(LOAD_CONTENT, { chapters, topics })
      commit(UPDATE_FILE_METADATA, { id, name })
    },
    [INIT_FILES] ({ commit }) {
      const documents = ChapterStorage.getAllDocuments()
      commit(LOAD_FILES, documents)
    }
  },
  mutations: {
    [ADD_FILE] (state, file) {
      state.ownedFiles.push(file)
      ChapterStorage.addDocument(file)
    },
    [LOAD_FILES] (state, files) {
      state.ownedFiles = files
    },
    [UPDATE_FILE_METADATA] (state, { id, name }) {
      state.currentFile = { id, name }
    }
  }
}

export default store
