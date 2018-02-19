<template>
  <div>
    <p>Accounts with a payment due date over 35 days from today:</p>
    <p v-if="!compUsers.length">(none)</p>
    <div v-for="user in compUsers" :key="user.id">
      <span>
        {{user.email}} (due {{user.payment_period_end}})
      </span>
      <button class="button-red" @click="uncomp(user.id)">Uncomp</button>
    </div>
    <p class="error" v-if="error" v-text="error"></p>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  created () {
    this.getCompUsers()
  },
  data () {
    return {
      compUsers: null,
      error: null
    }
  },
  methods: {
    getCompUsers () {
      adminApi.getCompUsers().then(users => {
        this.compUsers = users
      }, err => {
        this.error = err
      })
    },
    uncomp (id) {
      this.error = null
      adminApi.uncompUser({ id }).then(() => {
        this.getCompUsers()
      }, err => {
        this.error = err
      })
    }
  }
}
</script>

<style scoped>

</style>
