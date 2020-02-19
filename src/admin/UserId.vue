<template>
  <div>
    <p>
      <strong>Get user ID by %email% (limit 50):</strong>
    </p>
    <div>
      <input 
        type="text" 
        v-model="userEmail" 
        placeholder="bob@example.com"
      >
    </div>
    <div>
      <button 
        class="button-green" 
        @click="getUserId()"
      >
        Get user ID
      </button>
    </div>
    <div v-if="matchingUsers && matchingUsers.length">
      <div 
        v-for="user in matchingUsers" 
        :key="user.id"
      >
        {{ user.email }}: {{ user.id }}
      </div>
    </div>
    <div v-else>
      No matching users found.
    </div>
  </div>
</template>

<script>
import adminApi from './api'

export default {
  data() {
    return {
      userEmail: null,
      matchingUsers: null,
    }
  },
  methods: {
    getUserId() {
      adminApi.getUserId({ email: this.userEmail }).then((users) => {
        this.matchingUsers = users
      })
    },
  },
}
</script>

<style scoped>

</style>
