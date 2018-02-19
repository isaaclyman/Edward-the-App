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

  addEmail ({ content, subject }) { return this.simplePost(route('emails/new'), { content, subject }) }
  deleteEmail ({ id }) { return this.simplePost(route('emails/delete'), { id }) }
  getPendingEmails () { return this.simpleGet(route('emails/pending')) }
  getUserEmails () { return this.simpleGet(route('emails/csv')) }
  reviewEmail ({ id }) { return this.simplePost(route('emails/review'), { id }) }
  sendEmail ({ id }) { return this.simplePost(route('emails/send'), { id }) }

  deleteUnverifiedUsers () { return this.simplePost(route('delete-unverified')) }

  getCompUsers () { return this.simpleGet(route('comp-users')) }
  getSpaceOverages () { return this.simpleGet(route('space-overages')) }
  getTotalUsers () { return this.simpleGet(route('total-users')) }
  getUnverifiedUsers () { return this.simpleGet(route('unverified-users')) }

  uncompUser ({ id }) { return this.simplePost(route('uncomp'), { id }) }
}

export default new AdminApi()
