export const ADD_WORKSHOP = 'ADD_WORKSHOP'
export const ARCHIVE_WORKSHOP = 'ARCHIVE_WORKSHOP'
export const DELETE_WORKSHOP = 'DELETE_WORKSHOP'
export const RESTORE_WORKSHOP = 'RESTORE_WORKSHOP'
export const UPDATE_WORKSHOPS_CONTENT = 'UPDATE_WORKSHOPS_CONTENT'

export const LOAD_WORKSHOPS = 'LOAD_WORKSHOPS'
export const LOAD_WORKSHOP_LIST = 'LOAD_WORKSHOP_LIST'
export const NUKE_WORKSHOPS = 'NUKE_WORKSHOPS'

const store = {
  state: {
    // workshop [{ archived bool false, guid Guid, title string, order number, workshopName string, content Delta null, date Date }]
    workshops: [],
    // workshopListItem [{ archived bool false, date Date, guid Guid, workshopName string }]
    workshopList: []
  },
  mutations: {
    // Standard workshop mutations
    [ADD_WORKSHOP] (state, { workshop }) {
      state.workshops.push(workshop)
    },
    [ARCHIVE_WORKSHOP] (state, { workshop }) {
      if (!state.workshops.includes(workshop)) {
        throw new Error(`${ARCHIVE_WORKSHOP}: Cannot archive workshop "${workshop.title}": does not exist.`)
      }

      workshop.archived = true
    },
    [DELETE_WORKSHOP] (state, { workshop }) {
      if (!state.workshops.includes(workshop)) {
        throw new Error(`${DELETE_WORKSHOP}: Cannot delete workshop "${workshop.title}": does not exist.`)
      }

      state.workshops.splice(state.workshops.indexOf(workshop), 1)
    },
    [RESTORE_WORKSHOP] (state, { workshop }) {
      if (!state.workshops.includes(workshop)) {
        throw new Error(`${RESTORE_WORKSHOP}: Cannot restore workshop "${workshop.title}": does not exist.`)
      }

      workshop.archived = false
    },
    [UPDATE_WORKSHOPS_CONTENT] (state, { workshopUpdates: [...workshopUpdates] }) {
      for (const { workshop, newContent } of workshopUpdates) {
        if (!state.workshops.includes(workshop)) {
          throw new Error(`${UPDATE_WORKSHOPS_CONTENT}: Cannot update workshop "${workshop.title}": does not exist.`)
        }

        workshop.content = newContent
      }
    },

    // Overwrite all workshops or the workshop list
    [LOAD_WORKSHOPS] (state, { workshops }) {
      if (!Array.isArray(workshops)) {
        throw new Error(`${LOAD_WORKSHOPS}: Cannot load workshops: argument is not an array.`)
      }

      state.workshops = workshops
    },
    [LOAD_WORKSHOP_LIST] (state, { workshopList }) {
      if (!Array.isArray(workshopList)) {
        throw new Error(`${LOAD_WORKSHOP_LIST}: Cannot load workshops list: argument is not an array.`)
      }

      state.workshopList = workshopList
    },
    [NUKE_WORKSHOPS] (state) {
      state.workshops = null
      state.workshopList = null
    }
  }
}

export default store
