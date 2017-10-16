import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  logIn (email, password) {
    return new Promise((resolve, reject) => {
      axios.post(route('login'), { email, password }).then(() => {
        resolve()
      }, () => {
        reject()
      })
    })
  },
  signUp (email, password) {
    return new Promise((resolve, reject) => {
      axios.post(route('signup'), { email, password }).then(() => {
        resolve()
      }, () => {
        reject()
      })
    })
  }
}

export default api
