export const UPDATE_CONTENT = 'UPDATE_CONTENT'
export const UPDATE_SELECTION = 'UPDATE_SELECTION'

const store = {
  state: {
    deltaContent: null,
    selection: {
      range: null,
      text: ''
    }
  },
  mutations: {
    [UPDATE_CONTENT] (state, delta) {
      state.deltaContent = delta
    },
    [UPDATE_SELECTION] (state, selection) {
      state.selection = selection
    }
  }
}

export default store
