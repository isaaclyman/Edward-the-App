<template>
  <div class="wrap">
    <div class="delete">
      <h1>Is this goodbye?</h1>
      <p>
        All your data will be lost permanently. <strong>There is no way to undo this.</strong>
        If you want to keep your documents, you should download them first.
      </p>
      <p>To continue, type your account password below and click "Delete my account".</p>
      <div class="actions">
        <input 
          class="password-input" 
          type="password" 
          v-model="password" 
          autocomplete="off" 
          :disabled="saving"
        >
        <button 
          v-if="!saving" 
          class="button-red" 
          @click="deleteAccount"
        >
          Delete my account
        </button>
        <pulse-loader v-if="saving" />
      </div>
      <div 
        class="error" 
        v-if="error"
      >
        That didn't work. Please check your password and try again.
        If the problem persists, contact <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>.
      </div>
    </div>
    <hr>
    <div class="cancel">
      <router-link to="/account">
        <button class="button-link">
          Never mind, go back
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  components: {
    PulseLoader,
  },
  data() {
    return {
      error: false,
      password: '',
      saving: false,
    }
  },
  methods: {
    deleteAccount() {
      this.saving = true
      this.error = false
      authApi.deleteAccount({ password: this.password }).then(() => {
        this.saving = false
        this.$router.push('/login')
      }, (err) => {
        this.error = true
        this.saving = false
        console.error(err)
      })
    },
  },
}
</script>

<style scoped>
hr {
  margin: 16px 0;
  width: 100%;
}

.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.delete, .cancel {
  max-width: 1200px;
  padding: 0 50px;
  width: 100%;
}

.actions {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.password-input {
  margin-bottom: 12px;
  width: 300px;
}

.error {
  color: #DA0000;
}

.cancel {
  margin-bottom: 20px;
}
</style>
