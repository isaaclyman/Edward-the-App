export const SET_DEFAULT_USER = 'SET_DEFAULT_USER'
export const SET_USER = 'SET_USER'

const defaultUser = {
  accountType: {
    description: 'Either your internet or our servers are down right now.',
    displayName: 'Connectivity issues',
    name: 'ERROR'
  },
  email: 'ERROR'
}

const store = {
  state: {
    // user { accountType accountType, email string }
    // accountType { description string, displayName string, name string }
    user: {}
  },
  mutations: {
    [SET_DEFAULT_USER] (state) {
      state.user = defaultUser
    },
    [SET_USER] (state, user) {
      state.user = user
    }
  }
}

export default store
