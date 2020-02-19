<template>
  <div class="wrap">
    <div v-if="authLoading">
      <pulse-loader />
    </div>
    <div v-if="!authFailed && !authLoading">
      <h3>Let's change your password.</h3>
      <div class="message">
        Enter your new password below and click the button.
      </div>
      <div class="input">
        <input 
          class="password-input" 
          type="password" 
          v-model="password"
          placeholder="Type your new password here"
        >
      </div>
      <div v-if="resetLoading">
        <pulse-loader />
      </div>
      <div 
        class="error" 
        v-if="resetFailed"
      >
        <p>
          Password reset failed.
        </p>
        <p>
          Please try again later or contact <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>.
        </p>
      </div>
      <div 
        class="success" 
        v-if="success"
      >
        Password changed!
      </div>
      <div class="actions">
        <button 
          v-if="!success" 
          class="button-green submit-button" 
          @click="submit()"
        >
          Set password
        </button>
        <button 
          v-if="success" 
          class="button-green finish-button" 
          @click="finish()"
        >
          Go to the app
        </button>
      </div>
    </div>
    <div
      v-if="authFailed"
      class="failed"
    >
      <h3>This link doesn't work.</h3>
      <p>
        If you're trying to reset your password, please go back to the
        <router-link to="/forgot">
          Forgot Password
        </router-link> screen and try again.
      </p>
    </div>
    <div class="cancel">
      <router-link to="/login">
        <button class="button-link">
          Back to login
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import { goToApp } from './shared'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  beforeCreate() {
    const { email, key } = this.$route.params

    this.authLoading = true
    authApi.authenticatePasswordReset({ email, key }).then(() => {
      this.authLoading = false
    }, () => {
      this.authLoading = false
      this.authFailed = true
    })
  },
  components: {
    PulseLoader,
  },
  data() {
    return {
      authFailed: false,
      authLoading: true,
      resetFailed: false,
      resetLoading: false,
      password: '',
      success: false,
    }
  },
  methods: {
    finish() {
      goToApp()
    },
    submit() {
      this.resetFailed = false

      this.resetLoading = true
      authApi.updatePassword(this.password).then(() => {
        this.resetLoading = false
        this.success = true
      }, (err) => {
        this.resetLoading = false
        this.success = false
        this.resetFailed = true
        console.error(err)
      })
    },
  },
}
</script>

<style scoped>
.wrap {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 20px;
  font-weight: bold;
}

h3 {
  font-size: 34px;
  font-weight: normal;
  margin-bottom: 32px;
  margin-top: 0;
}

.message {
  margin-bottom: 16px;
  margin-top: 0;
}

.input {
  margin-bottom: 32px;
}

.input input {
  border: 2px solid #323232;
  border-radius: 6px;
  color: #323232;
  font-size: 20px;
  font-weight: bold;
  height: 64px;
  padding: 18px 16px;
  text-align: left;
  width: 100%;
}

input::placeholder {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.actions, .cancel {
  margin-top: 32px;
}

a, .failed a {
  color: #323232;
  font-size: 20px;
  font-weight: bold;
}

.cancel button {
  padding: 3px 0;
}
</style>
