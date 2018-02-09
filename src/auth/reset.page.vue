<template>
  <div class="wrap">
    <div class="inner">
      <div v-if="authLoading">
        <pulse-loader></pulse-loader>
      </div>
      <div v-if="!authFailed && !authLoading">
        <div class="message">
          <h4>Let's change your password.</h4>
          <p>
            Enter your new password below and click the button.
          </p>
        </div>
        <div class="input">
          <input class="password-input" type="password" v-model="password">
        </div>
        <div v-if="resetLoading">
          <pulse-loader></pulse-loader>
        </div>
        <div class="error" v-if="resetFailed">
          <p>
            Password reset failed.
          </p>
          <p>
            Please try again later or contact <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>.
          </p>
        </div>
        <div class="success" v-if="success">
          Password changed!
        </div>
        <div class="actions">
          <button v-if="!success" class="button-green submit-button" @click="submit()">Set password</button>
          <button v-if="success" class="button-green finish-button" @click="finish()">Go to the app</button>
        </div>
      </div>
      <div v-if="authFailed">
        <h1>This link doesn't work.</h1>
        <p>
          If you're trying to reset your password, please go back to the
          <router-link to="/forgot">Forgot Password</router-link> screen and try again.
        </p>
      </div>
      <div class="cancel">
        <router-link to="/login">
          <button class="button-link">Back to login</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import { goToApp } from './shared'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  beforeCreate () {
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
    PulseLoader
  },
  data () {
    return {
      authFailed: false,
      authLoading: true,
      resetFailed: false,
      resetLoading: false,
      password: '',
      success: false
    }
  },
  methods: {
    finish () {
      goToApp()
    },
    submit () {
      this.resetFailed = false

      this.resetLoading = true
      authApi.updatePassword({ password: this.password }).then(() => {
        this.resetLoading = false
        this.success = true
      }, err => {
        this.resetLoading = false
        this.success = false
        this.resetFailed = true
        console.error(err)
      })
    }
  }
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.inner {
  max-width: 1200px;
  padding: 20px 50px;
  width: 100%;
}

.input input {
  width: 300px;
}

.actions, .cancel {
  margin-top: 20px;
}
</style>
