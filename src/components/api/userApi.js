import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  simpleGet (route) {
    return axios.get(route).then(response => {
      return response.data
    })
  },
  simplePost (route, body) {
    return axios.post(route, body).then(response => {
      return response.data
    })
  },

  getUser () { return this.simpleGet(route('current')) },
  logOut () { return this.simpleGet(route('logout')) },
  sendVerifyLink () { return this.simplePost(route('send-verify-link')) },
  updateEmail (email) { return this.simplePost(route('email'), { email }) },
  updatePassword (password) { return this.simplePost(route('password'), { password }) },
  verify (email, key) { return this.simplePost(route('verify'), { email, key }) }
}

export default api
