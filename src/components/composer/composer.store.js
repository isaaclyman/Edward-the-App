export const UPDATE_CONTENT = 'UPDATE_CONTENT'

const store = {
  state: {
    deltaContent: null
  },
  mutations: {
    [UPDATE_CONTENT] (state, delta) {
      state.deltaContent = delta
    }
  }
}

export default store
