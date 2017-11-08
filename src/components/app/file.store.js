import { storageApiPromise } from '../api/storageSwitch'
import guid from './guid'
import { LOAD_CONTENT, NUKE_CONTENT } from './chapters.store'

export const ADD_FILE = 'ADD_FILE'
export const CHANGE_FILE = 'CHANGE_FILE'
export const DELETE_DOCUMENT = 'DELETE_DOCUMENT'
export const INIT_FILES = 'INIT_FILES'
export const REMOVE_OWNED_FILE = 'REMOVE_OWNED_FILE'
export const SET_UP_DOCUMENT = 'SET_UP_DOCUMENT'
export const UNLOAD_CURRENT_DOCUMENT = 'UNLOAD_CURRENT_DOCUMENT'
export const UPDATE_FILE_NAME = 'UPDATE_FILE_NAME'

const LOAD_FILES = 'LOAD_FILES'
const UPDATE_FILE_METADATA = 'UPDATE_FILE_METADATA'

// Always use localStorage to store the document currently in progress
const cacheKey = 'CURRENT_DOCUMENT'
const cache = {
  getCurrentFile () {
    return JSON.parse(window.localStorage.getItem(cacheKey))
  },
  setCurrentFile (file) {
    window.localStorage.setItem(cacheKey, JSON.stringify(file))
  }
}

const store = {
  state: {
    currentFile: null, // file { id String, name String }
    ownedFiles: [] // file[]
  },
  actions: {
    [CHANGE_FILE] ({ commit, dispatch }, { id, name }) {
      return dispatch(UNLOAD_CURRENT_DOCUMENT).then(() => {
        return storageApiPromise.then(storage => {
          // Get the new file from storage
          const promises = [storage.getAllChapters(id), storage.getAllPlans(id), storage.getAllTopics(id)]

          return Promise.all(promises).then(([chapters, plans, topics]) => {
            commit(LOAD_CONTENT, { plans, chapters, topics })
            commit(UPDATE_FILE_METADATA, { id, name })

            cache.setCurrentFile({ id, name })
          }, err => {
            throw err
          })
        })
      })
    },
    [DELETE_DOCUMENT] ({ commit, dispatch }, { id }) {
      dispatch(UNLOAD_CURRENT_DOCUMENT).then(() => {
        commit(REMOVE_OWNED_FILE, { id })
      })
    },
    [INIT_FILES] ({ commit, dispatch }) {
      return storageApiPromise.then(storage => {
        return storage.getAllDocuments().then(documents => {
          commit(LOAD_FILES, documents)
          const currentFile = cache.getCurrentFile()
          if (currentFile) {
            dispatch(CHANGE_FILE, currentFile)
          }
        })
      })
    },
    [SET_UP_DOCUMENT] ({ commit, dispatch }, { file, type }) {
      commit(ADD_FILE, file)
      dispatch(CHANGE_FILE, file).then(() => {
        const plans = type.plans.map(title => ({
          archived: false,
          id: guid(),
          title,
          sections: [{
            archived: false,
            content: null,
            id: guid(),
            tags: [],
            title
          }]
        }))

        const chapters = type.chapters.map(title => ({
          archived: false,
          content: null,
          id: guid(),
          title,
          topics: {}
        }))

        const topics = type.topics.map(title => ({
          archived: false,
          id: guid(),
          title
        }))

        commit(LOAD_CONTENT, { plans, chapters, topics })

        return storageApiPromise.then(storage => {
          return storage.saveAllContent(file.id, { chapters, plans, topics })
        })
      })
    },
    [UNLOAD_CURRENT_DOCUMENT] ({ commit }) {
      return new Promise(resolve => {
        commit(UPDATE_FILE_METADATA, { id: null, name: null })
        commit(NUKE_CONTENT)
        resolve()
      })
    }
  },
  mutations: {
    [ADD_FILE] (state, { id, name }) {
      state.ownedFiles.push({ id, name })
    },
    [LOAD_FILES] (state, files) {
      state.ownedFiles = files
    },
    [REMOVE_OWNED_FILE] (state, { id }) {
      let fileIndex
      state.ownedFiles.some((file, index) => {
        if (file.id === id) {
          fileIndex = index
          return true
        }
      })
      state.ownedFiles.splice(fileIndex, 1)
    },
    [UPDATE_FILE_METADATA] (state, { id, name }) {
      state.currentFile = { id, name }
    },
    [UPDATE_FILE_NAME] (state, { id, name }) {
      state.currentFile.name = name
      cache.setCurrentFile({ id, name })

      state.ownedFiles.some(file => {
        if (file.id === id) {
          file.name = name
          return true
        }
      })
    }
  }
}

export default store
