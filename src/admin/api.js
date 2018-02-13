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

  getTotalUsers () { return this.simpleGet(route('total-users')) }
  getSpaceOverages () { return this.simpleGet(route('space-overages')) }
}

export default new AdminApi()
