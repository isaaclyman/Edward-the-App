import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  demoLogIn () {
    return (
      axios.post(route('demo-login'), {}).then(response => response.data)
    )
  },
  getUser () {
    return (
      axios.get(route('current')).then(response => response.data)
    )
  },
  logIn ({ email, password, captchaResponse, integration }) {
    return (
      axios.post(route('login'), { email, password, captchaResponse, integration })
        .then(response => response.data)
    )
  },
  logOut () {
    return (
      axios.get(route('logout'))
    )
  },
  signUp ({ about, email, password, captchaResponse, integration }) {
    return (
      axios.post(route('signup'), { about, email, password, captchaResponse, integration })
        .then(response => response.data)
    )
  },
  upgrade ({ oldAccountType, newAccountType }) {
    return (
      axios.post(route('upgrade'), { oldAccountType, newAccountType })
        .then(response => response.data)
    )
  }
}

export default api
