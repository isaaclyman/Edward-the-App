import axios from 'axios'

const route = route => `/api/admin/${route}`

class AdminApi {
  simpleGet (route) {
    return axios.get(route).then(response => {
      return response.data
    })
  }
  simplePost (route, body) {
    return axios.post(route, body).then(response => {
      return response.data
    })
  }

  deleteUnverifiedUsers () { return this.simplePost(route('delete-unverified')) }

  getSpaceOverages () { return this.simpleGet(route('space-overages')) }
  getTotalUsers () { return this.simpleGet(route('total-users')) }
  getUnverifiedUsers () { return this.simpleGet(route('unverified-users')) }
}

export default new AdminApi()
