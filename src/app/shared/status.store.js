export const CLEAR_ERROR = 'CLEAR_ERROR'
export const SET_STATUS_DONE = 'SET_STATUS_DONE'
export const SET_STATUS_ERROR = 'SET_STATUS_ERROR'
export const SET_STATUS_SAVING = 'SET_STATUS_SAVING'

const store = {
  state: {
    error: false,
    saving: false
  },
  mutations: {
    [CLEAR_ERROR] (state) {
      state.error = false
    },
    [SET_STATUS_DONE] (state) {
      state.saving = false
    },
    [SET_STATUS_ERROR] (state) {
      state.saving = false
      state.error = true
    },
    [SET_STATUS_SAVING] (state) {
      state.saving = true
    }
  }
}

export default store
