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

  getPremiumSignups () { return this.simpleGet(route('premium-signups')) }
  getSpaceOverages () { return this.simpleGet(route('space-overages')) }
  getTotalUsers () { return this.simpleGet(route('total-users')) }
  getUnverifiedUsers () { return this.simpleGet(route('unverified-users')) }

  compUser ({ id, months }) { return this.simplePost(route('comp'), { id, months }) }
  getCompUsers () { return this.simpleGet(route('comp-users')) }
  uncompUser ({ id }) { return this.simplePost(route('uncomp'), { id }) }

  getBackup ({ userId }) { return this.simpleGet(route(`backup/${userId}`)) }
  restoreBackup ({ userId, documents }) { return this.simplePost(route(`backup/restore`), { userId, documents }) }

  getUserId ({ email }) { return this.simpleGet(route(`user-id/${email}`)) }
}

export default new AdminApi()
