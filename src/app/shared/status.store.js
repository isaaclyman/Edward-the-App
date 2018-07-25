export const SET_STATUS_DONE = 'SET_STATUS_DONE'
export const SET_STATUS_ERROR = 'SET_STATUS_ERROR'
export const SET_STATUS_OFFLINE = 'SET_STATUS_OFFLINE'
export const SET_STATUS_SAVING = 'SET_STATUS_SAVING'

export const Statuses = {
  SAVED: 'SAVED',
  SAVING: 'SAVING',
  ERROR: 'ERROR',
  OFFLINE: 'OFFLINE'
}

const store = {
  state: {
    status: Statuses.SAVED
  },
  mutations: {
    [SET_STATUS_DONE] (state) {
      state.status = Statuses.SAVED
    },
    [SET_STATUS_ERROR] (state) {
      state.status = Statuses.ERROR
    },
    [SET_STATUS_OFFLINE] (state) {
      state.status = Statuses.OFFLINE
    },
    [SET_STATUS_SAVING] (state) {
      if (state.status !== Statuses.OFFLINE) {
        state.status = Statuses.SAVING
      }
    }
  }
}

export default store
