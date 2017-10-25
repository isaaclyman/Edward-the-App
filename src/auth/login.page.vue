<template>
<div class="wrap">
  <hr class="divider">
  <div class="username">
    <label for="login-username-input">Email address:</label>
    <input id="login-username-input" class="login-field" type="text" v-model="email">
  </div>
  <div class="password">
    <label for="login-password-input">Password:</label>
    <input id="login-password-input" class="login-field" type="password" v-model="password">
  </div>
  <div class="captcha">
    <Captcha @change="setCaptchaResponse" @expire="resetCaptchaResponse" ref="captcha"></Captcha>
  </div>
  <div class="messages">
    <p>{{ loginMessage }}</p>
  </div>
  <div class="actions">
    <pulse-loader v-if="loading"></pulse-loader>
    <button v-if="!loading" class="login-button button-green" :disabled="!canLogin" @click="logIn()">Log In</button>
  </div>
  <hr class="divider">
  <div class="sign-up">
    <div class="sign-up-text">Don't have an account?</div>
    <button class="sign-up-link button-link" @click="signUp()">Sign up for free.</button>
  </div>
</div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'
import { goToApp } from './shared'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  components: {
    Captcha,
    PulseLoader
  },
  computed: {
    canLogin () {
      return (
        !!this.email.trim() &&
        !!this.password.trim()
      )
    }
  },
  data () {
    return {
      captchaResponse: '',
      email: '',
      loading: false,
      loginMessage: '',
      password: ''
    }
  },
  methods: {
    logIn () {
      this.loginMessage = ''

      if (!this.captchaResponse) {
        this.loginMessage = 'Please indicate that you are not a robot.'
        return
      }

      this.loading = true

      authApi.logIn({
        email: this.email,
        password: this.password,
        captchaResponse: this.captchaResponse
      }).then(result => {
        this.loading = false
        if (result.limited) {
          this.$router.push('/limited')
        } else {
          goToApp()
        }
      }, () => {
        this.loading = false
        this.$refs.captcha.reset()
        this.loginMessage = 'Login failed. Please try again.'
      })
    },
    resetCaptchaResponse () {
      this.captchaResponse = ''
    },
    setCaptchaResponse (response) {
      this.captchaResponse = response
    },
    signUp () {
      this.$router.push('/signup')
    }
  }
}
</script>

<style scoped>
.wrap {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 16px;
  justify-content: center;
}

.sign-up {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
}

.sign-up-text {
  display: flex;
  justify-content: center;
}

.sign-up-link {
  font-size: 16px;
}

.divider {
  background-color: #CCC;
  height: 1px;
  margin: 20px 0;
  width: 100%;
}

.username, .password {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  margin-bottom: 20px;
  width: 100%;
}

.login-field {
  border: none;
  border-bottom: 1px solid #e8cc84;
  width: 300px;
}

.captcha {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  width: 100%;
}

.messages {
  align-items: center;
  color: red;
  display: flex;
  font-size: 12px;
  height: 20px;
  justify-content: center;
  margin: 0;
  margin-bottom: 6px;
  width: 100%;
}

.actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.login-button {
  font-size: 16px;
}
</style>
