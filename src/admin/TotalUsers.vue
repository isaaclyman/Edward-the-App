<template>
  <div class="stat">
    <div v-if="userCount !== null">
      <p>
        <strong>Users by type</strong>
      </p>
      <p>Demo: {{ userCount.demo }}</p>
      <p>Limited: {{ userCount.limited }}</p>
      <p>Premium: {{ userCount.premium }}</p>
      <p>Gold: {{ userCount.gold }}</p>
      <p>Admin: {{ userCount.admin }}</p>
      <p>TOTAL: {{ totalUsers }}</p>
    </div>
    <div 
      class="error" 
      v-if="error" 
      v-text="error"/>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate() {
    adminApi.getTotalUsers().then((resp) => {
      this.userCount = resp
    }, (err) => {
      this.error = err
    })
  },
  computed: {
    totalUsers() {
      if (!this.userCount) {
        return 0
      }

      return (
        Number(this.userCount.demo) +
        Number(this.userCount.limited) +
        Number(this.userCount.premium) +
        Number(this.userCount.gold) +
        Number(this.userCount.admin)
      )
    },
  },
  data() {
    return {
      error: null,
      userCount: null,
    }
  },
}
</script>

<style scoped>

</style>
