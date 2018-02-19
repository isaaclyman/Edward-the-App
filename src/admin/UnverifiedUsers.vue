<template>
  <div class="stat">
    <p>Unverified users (limit 150):</p>
    <p v-if="users" v-text="usersDisplay"></p>
    <button class="button-green" @click="deleteUnverified()">Delete unverified users older than 72 hours</button>
    <div class="success" v-if="success">Success!</div>
    <div class="error" v-if="error" v-text="error"></div>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate () {
    adminApi.getUnverifiedUsers().then(resp => {
      this.users = resp
    }, err => {
      this.error = err
    })
  },
  computed: {
    usersDisplay () {
      return this.users && this.users.map(user => {
        if (!user.daysUnverified) {
          user.daysUnverified = Math.round((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
        }
        return `${user.email} (${user.daysUnverified})`
      }).join(', ')
    }
  },
  data () {
    return {
      error: null,
      success: false,
      users: null
    }
  },
  methods: {
    deleteUnverified () {
      this.error = false
      this.success = false
      adminApi.deleteUnverifiedUsers().then(() => {
        this.success = true
      }, err => {
        this.error = err
      })
    }
  }
}
</script>

<style scoped>

</style>
