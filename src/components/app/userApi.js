import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  getUser () {
    return new Promise((resolve, reject) => {
      axios.get(route('current')).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  },
  logOut () {
    return new Promise((resolve, reject) => {
      axios.get(route('logout')).then(() => resolve(), () => reject())
    })
  }
}

export default api
