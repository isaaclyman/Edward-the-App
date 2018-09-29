export const UPDATE_SELECTION = 'UPDATE_SELECTION'

const store = {
  state: {
    selection: {
      range: null,
      text: '',
    },
  },
  mutations: {
    [UPDATE_SELECTION](state, selection) {
      state.selection = selection
    },
  },
}

export default store
