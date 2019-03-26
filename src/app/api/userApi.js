import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  simpleGet(route) {
    return axios.get(route).then(response => response.data)
  },
  simplePost(route, body) {
    return axios.post(route, body).then(response => response.data)
  },

  getUser() {
    return this.simpleGet(route('current'))
  },
  logOut() {
    return this.simpleGet(route('logout'))
  }
}

export default api
