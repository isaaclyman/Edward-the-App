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
    <hr>
    <div class="comp-form">
      <p>Comp an account:</p>
      <div class="comp-form">
        <input type="number" v-model="userId" placeholder="User ID">
        <input type="number" v-model="months" placeholder="# of months to comp">
        <button class="button-green" @click="comp()">Comp this user</button>
      </div>
      <div class="error" v-if="compError" v-text="compError"></div>
    </div>
  </div>
</template>

<script>
import adminApi from './api'
import swal from 'sweetalert'

export default {
  created () {
    this.getCompUsers()
  },
  data () {
    return {
      compError: null,
      compUsers: null,
      error: null,
      months: null,
      userId: null
    }
  },
  methods: {
    comp () {
      this.compError = false
      adminApi.compUser({ id: this.userId, months: this.months }).then(() => {
        this.months = null
        this.userId = null
        this.getCompUsers()
      }, err => {
        this.compError = err
      })
    },
    getCompUsers () {
      adminApi.getCompUsers().then(users => {
        this.compUsers = users
      }, err => {
        this.error = err
      })
    },
    uncomp (id) {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Are you sure? This user's next payment will be due in 1 month.`,
        title: 'Uncomp user?'
      }).then(willUncomp => {
        if (!willUncomp) {
          return
        }

        this.error = null
        adminApi.uncompUser({ id }).then(() => {
          this.getCompUsers()
        }, err => {
          this.error = err
        })
      })
    }
  }
}
</script>

<style scoped>
.comp-form {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
}

.comp-form input {
  margin-bottom: 12px;
  width: 200px;
}
</style>
