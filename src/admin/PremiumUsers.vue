<template>
  <div class="stat">
    <p>New Author account signups (limit 150):</p>
    <p 
      v-if="users" 
      v-text="usersDisplay"/>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  beforeCreate() {
    adminApi.getPremiumSignups().then((resp) => {
      this.users = resp
    }, (err) => {
      this.error = err
    })
  },
  computed: {
    usersDisplay() {
      return this.users && this.users.map((user) => {
        if (!user.daysSinceUpdate) {
          user.daysSinceUpdate = Math.round((Date.now() - new Date(user.updated_at)) / (1000 * 60 * 60 * 24))
        }
        return `${user.email} (updated ${user.daysSinceUpdate} days ago)`
      }).join(', ')
    },
  },
  data() {
    return {
      users: null,
    }
  },
}
</script>

<style scoped>

</style>
