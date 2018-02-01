import Cache from './cache'
import { storageApiPromise } from '../api/storageSwitch'
import guid from './guid'
import { LOAD_CONTENT, NUKE_CONTENT } from './chapters.store'

export const ADD_DOCUMENT = 'ADD_DOCUMENT'
export const CHANGE_DOCUMENT = 'CHANGE_DOCUMENT'
export const DELETE_DOCUMENT = 'DELETE_DOCUMENT'
export const INIT_DOCUMENTS = 'INIT_DOCUMENTS'
export const REMOVE_OWNED_DOCUMENT = 'REMOVE_OWNED_DOCUMENT'
export const SET_UP_DOCUMENT = 'SET_UP_DOCUMENT'
export const UNLOAD_CURRENT_DOCUMENT = 'UNLOAD_CURRENT_DOCUMENT'
export const UPDATE_DOCUMENT_NAME = 'UPDATE_DOCUMENT_NAME'

const LOAD_DOCUMENTS = 'LOAD_DOCUMENTS'
const UPDATE_DOCUMENT_METADATA = 'UPDATE_DOCUMENT_METADATA'

// Cache the document currently in progress
const cache = new Cache('CURRENT_DOCUMENT')

const store = {
  state: {
    currentDocument: null, // document { guid String, name String }
    ownedDocuments: [] // document[]
  },
  actions: {
    [CHANGE_DOCUMENT] ({ commit, dispatch }, { guid, name }) {
      return dispatch(UNLOAD_CURRENT_DOCUMENT).then(() => {
        return storageApiPromise.then(storage => {
          // Get the new document from storage
          const promises = [storage.getAllChapters(guid), storage.getAllPlans(guid), storage.getAllTopics(guid)]

          return Promise.all(promises).then(([chapters, plans, topics]) => {
            commit(LOAD_CONTENT, { plans, chapters, topics })
            commit(UPDATE_DOCUMENT_METADATA, { guid, name })

            cache.cacheSet({ guid, name })
          }, err => {
            throw err
          })
        })
      })
    },
    [DELETE_DOCUMENT] ({ commit, dispatch }, { guid }) {
      dispatch(UNLOAD_CURRENT_DOCUMENT).then(() => {
        commit(REMOVE_OWNED_DOCUMENT, { guid })
      })
    },
    [INIT_DOCUMENTS] ({ commit, dispatch, state }) {
      return storageApiPromise.then(storage => {
        return storage.getAllDocuments().then(documents => {
          commit(LOAD_DOCUMENTS, documents)
          const currentDocument = cache.cacheGet()

          if (!currentDocument || !state.ownedDocuments.some(document => document.guid === currentDocument.guid)) {
            return
          }

          dispatch(CHANGE_DOCUMENT, currentDocument)
        })
      })
    },
    [SET_UP_DOCUMENT] ({ commit, dispatch }, { document, type }) {
      const plans = type.plans.map(title => ({
        archived: false,
        guid: guid(),
        title,
        sections: [{
          archived: false,
          content: null,
          guid: guid(),
          tags: [],
          title
        }]
      }))

      const chapters = type.chapters.map(title => ({
        archived: false,
        content: null,
        guid: guid(),
        title,
        topics: {}
      }))

      const topics = type.topics.map(title => ({
        archived: false,
        guid: guid(),
        title
      }))

      return storageApiPromise.then(storage => {
        return storage.addDocument(document).then(() => storage)
      }).then(storage => {
        return storage.saveAllContent(document.guid, { chapters, plans, topics })
      }).then(() => {
        commit(ADD_DOCUMENT, document)
        return dispatch(CHANGE_DOCUMENT, document)
      }).then(() => {
        return commit(LOAD_CONTENT, { plans, chapters, topics })
      })
    },
    [UNLOAD_CURRENT_DOCUMENT] ({ commit }) {
      return new Promise(resolve => {
        commit(UPDATE_DOCUMENT_METADATA, { guid: null, name: null })
        commit(NUKE_CONTENT)
        resolve()
      })
    }
  },
  mutations: {
    [ADD_DOCUMENT] (state, { guid, name }) {
      state.ownedDocuments.push({ guid, name })
    },
    [LOAD_DOCUMENTS] (state, documents) {
      state.ownedDocuments = documents
    },
    [REMOVE_OWNED_DOCUMENT] (state, { guid }) {
      let documentIndex
      state.ownedDocuments.some((document, index) => {
        if (document.guid === guid) {
          documentIndex = index
          return true
        }
      })
      state.ownedDocuments.splice(documentIndex, 1)
    },
    [UPDATE_DOCUMENT_METADATA] (state, { guid, name }) {
      state.currentDocument = { guid, name }
    },
    [UPDATE_DOCUMENT_NAME] (state, { guid, name }) {
      state.currentDocument.name = name
      cache.cacheSet({ guid, name })

      state.ownedDocuments.some(document => {
        if (document.guid === guid) {
          document.name = name
          return true
        }
      })
    }
  }
}

export default store
