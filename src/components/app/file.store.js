import { NUKE_CONTENT, LOAD_CONTENT } from './chapters.store'

export const CHANGE_FILE = 'CHANGE_FILE'
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
      commit(LOAD_CONTENT, {
        chapters: [],
        topics: []
      })
      commit(UPDATE_FILE_METADATA, { id, name })
    }
  },
  mutations: {
    [UPDATE_FILE_METADATA] (state, { id, name }) {
      state.currentFile = { id, name }
    }
  }
}

export default store
