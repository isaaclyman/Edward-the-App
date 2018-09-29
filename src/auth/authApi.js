import axios from 'axios'

const route = route => `/api/user/${route}`

const api = {
  authenticatePasswordReset({ email, key }) {
    return (
      axios.post(route('authenticate-password-reset'), { email, key })
        .then(response => response.data)
    )
  },
  deleteAccount({ password }) {
    return (
      axios.post(route('delete-account'), { password })
        .then(response => response.data)
    )
  },
  demoLogIn() {
    return (
      axios.post(route('demo-login'), {}).then(response => response.data)
    )
  },
  getUser() {
    return (
      axios.get(route('current')).then(response => response.data)
    )
  },
  logIn({
    email, password, captchaResponse, integration,
  }) {
    return (
      axios.post(route('login'), {
        email, password, captchaResponse, integration,
      })
        .then(response => response.data)
    )
  },
  logOut() {
    return (
      axios.get(route('logout'))
    )
  },
  sendResetPasswordLink({ email, captchaResponse, integration }) {
    return (
      axios.post(route('send-reset-password-link'), { email, captchaResponse, integration })
        .then(response => response.data)
    )
  },
  sendVerifyLink() {
    return (
      axios.post(route('send-verify-link')).then(response => response.data)
    )
  },
  signUp({
    email, password, captchaResponse, integration,
  }) {
    return (
      axios.post(route('signup'), {
        email, password, captchaResponse, integration,
      })
        .then(response => response.data)
    )
  },
  updatePassword({ password }) {
    return (
      axios.post(route('password'), { password })
        .then(response => response.data)
    )
  },
  updatePayment({ token }) {
    return (
      axios.post(route('update-payment'), { token }).then(response => response.data)
    )
  },
  upgrade({ oldAccountType, newAccountType, token = null }) {
    return (
      axios.post(route('upgrade'), { oldAccountType, newAccountType, token })
        .then(response => response.data)
    )
  },
  verify({ email, key }) {
    return (
      axios.post(route('verify'), { email, key })
        .then(response => response.data)
    )
  },
}

export default api
