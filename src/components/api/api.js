import axios from 'axios'

const route = route => `/api/${route}`

class Api {
  simpleGet (route) {
    return new Promise((resolve, reject) => {
      axios.get(route).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  }
  simplePost (route, body) {
    return new Promise((resolve, reject) => {
      axios.post(route, body).then(response => {
        resolve(response.data)
      }, () => {
        reject()
      })
    })
  }

  addDocument (doc) { return this.simplePost(route('document/add'), doc) }
  deleteDocument (doc) { return this.simplePost(route('document/delete'), doc) }
  getDocuments () { return this.simpleGet(route('documents')) }
  updateDocument (doc) { return this.simplePost(route('document/update'), doc) }
}

export default new Api()
