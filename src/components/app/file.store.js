export const CHANGE_FILE = 'CHANGE_FILE'

const store = {
  state: {
    currentFile: null, // { id String, name String }
    ownedFiles: [] // currentFile[]
  },
  mutations: {
    [CHANGE_FILE] (state, { id, name }) {
      state.currentFile = { id, name }
    }
  }
}

export default store
