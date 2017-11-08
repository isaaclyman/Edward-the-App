import axios from 'axios'

const route = route => `/api/`

const api = {
  simpleGet (route) {
    return new Promise((resolve, reject) => {
      axios.get(route).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  },
  simplePost (route, body) {
    return new Promise((resolve, reject) => {
      axios.post(route, body).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  },

  addDocument: (doc) => this.simplePost(route('document/add'), doc),
  deleteDocument: (doc) => this.simplePost(route('document/delete'), doc),
  getDocuments: () => this.simpleGet(route('documents'))
}

export default api
