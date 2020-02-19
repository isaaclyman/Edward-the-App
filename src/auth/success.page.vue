<template>
  <div class="wrap">
    <div class="page">
      <h3>
        Your account change was successful. Thanks for using Edward!
      </h3>
      <div class="actions">
        <router-link to="/account">
          <button class="button-link">
            Back to account settings
          </button>
        </router-link>
        <button 
          class="button-green" 
          @click="finished()"
        >
          Go to the app
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  data() {
    return {}
  },
  methods: {
    finished() {
      goToApp()
    },
  },
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.page {
  padding: 0 50px;
}

.actions {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 16px 0;
}

.actions button {
  margin: 4px 0;
}
</style>
