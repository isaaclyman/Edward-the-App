<template>
  <div>
    <p>Export user emails as CSV for upload to Mailgun:</p>
    <button class="button-green" @click="getUserEmails()">Export</button>
    <div class="error" v-if="error" v-text="error"></div>
    <hr>
    <div v-if="pendingEmails">
      <p>Pending emails:</p>
      <p v-if="!pendingEmails.length">(none)</p>
      <div v-for="email in pendingEmails" :key="email.id">
        <span>
          <strong v-text="email.subject"></strong>
        </span>
        <button class="button-green" @click="reviewEmail(email.id)">Review</button>
        <button class="button-red" @click="deleteEmail(email.id)">Delete</button>
        <span v-if="reviewedId === email.id">Sent</span>
      </div>
    </div>
    <hr>
    <div class="new-email">
      <p>Create a new email:</p>
      <input type="text" v-model="newEmail.subject" placeholder="subject">
      <textarea v-model="newEmail.content" placeholder="content"></textarea>
      <button class="button-green" @click="createEmail()">Create</button>
      <div class="success" v-if="success">Success!</div>
    </div>
  </div>
</template>

<script>
import adminApi from './api'
import FileSaver from 'file-saver'

export default {
  created () {
    this.getPendingEmails()
  },
  data () {
    return {
      error: null,
      newEmail: {
        content: null,
        subject: null
      },
      pendingEmails: null,
      reviewedId: null,
      success: false
    }
  },
  methods: {
    createEmail () {
      this.error = null
      this.success = false
      adminApi.addEmail({
        content: this.newEmail.content,
        subject: this.newEmail.subject
      }).then(() => {
        this.success = true
        this.newEmail.content = null
        this.newEmail.subject = null
        this.getPendingEmails()
      }, err => {
        this.error = err
      })
    },
    deleteEmail (id) {
      this.error = null
      adminApi.deleteEmail({ id }).then(() => {
        this.getPendingEmails()
      }, err => {
        this.error = err
      })
    },
    getPendingEmails () {
      this.error = null
      adminApi.getPendingEmails().then(resp => {
        this.pendingEmails = resp
      }, err => {
        this.error = err
      })
    },
    getUserEmails () {
      this.error = null
      adminApi.getUserEmails().then(resp => {
        FileSaver.saveAs(new Blob([resp], { type: 'text/csv;charset=utf-8' }), 'emails-private.csv')
      }, err => {
        this.error = err
      })
    },
    reviewEmail (id) {
      this.error = null
      this.reviewedId = null
      adminApi.reviewEmail({ id }).then(() => {
        this.reviewedId = id
      }, err => {
        this.error = err
      })
    }
  }
}
</script>

<style scoped>
.new-email {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
}

.new-email input, .new-email textarea {
  margin-bottom: 12px;
  max-width: 100%;
  width: 400px;
}

.success {
  color: green;
}
</style>
