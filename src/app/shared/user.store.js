import userApi from '../api/userApi'

export const COMMIT_NEW_EMAIL = 'COMMIT_NEW_EMAIL'
export const SET_DEFAULT_USER = 'SET_DEFAULT_USER'
export const SET_USER = 'SET_USER'
export const SET_USER_PROMISE = 'SET_USER_PROMISE'
export const UPDATE_EMAIL = 'SET_USER_EMAIL'
export const UPDATE_PASSWORD = 'SET_USER_PASSWORD'

const defaultUser = {
  accountType: {
    description: 'Either your internet or our servers are down right now. Any work you do may be lost.',
    displayName: 'Connectivity issues',
    name: 'ERROR'
  },
  email: 'ERROR',
  isPremium: false,
  verified: true
}

// We provide a userPromise from the beginning to prevent race conditions,
//  which could be disastrous given that we store user data based on the
//  user type. However, the actual user API call occurs later, so we allow
//  deferred resolving of the original promise via SET_USER_PROMISE.
let userPromiseResolve

const store = {
  state: {
    // user { accountType accountType, email string, isPremium boolean }
    // accountType { description string, displayName string, name string }
    user: {},
    // A promise that will resolve once the user API call has returned.
    // It cannot be rejected.
    userPromise: new Promise((resolve) => {
      userPromiseResolve = resolve
    })
  },
  actions: {
    [UPDATE_EMAIL] ({ commit, state }, { email }) {
      commit(COMMIT_NEW_EMAIL, { email })
      return userApi.updateEmail(email)
    }
  },
  mutations: {
    [COMMIT_NEW_EMAIL] (state, { email }) {
      state.user.email = email
    },
    [SET_DEFAULT_USER] (state) {
      state.user = defaultUser
    },
    [SET_USER] (state, user) {
      state.user = user
    },
    [SET_USER_PROMISE] (state, promise) {
      promise.then(data => {
        userPromiseResolve(data)
      }, err => {
        userPromiseResolve(null, err)
      })
    },
    [UPDATE_PASSWORD] (state, { password }) {
      userApi.updatePassword(password)
    }
  }
}

export default store
