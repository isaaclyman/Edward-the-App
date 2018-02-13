<template>
  <div class="stat">
    <div v-if="totalUsers != null">
      <p>Total Users: {{totalUsers}}</p>
    </div>
    <div class="error" v-if="error" v-text="error"></div>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate () {
    adminApi.getTotalUsers().then(resp => {
      this.totalUsers = resp.count
    }, err => {
      this.error = err
    })
  },
  data () {
    return {
      error: null,
      totalUsers: null
    }
  }
}
</script>

<style scoped>

</style>
