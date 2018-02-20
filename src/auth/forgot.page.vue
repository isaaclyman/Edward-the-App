<template>
  <div class="wrap">
    <div class="forgot">
      <div class="message">
        <h3>Forgot your password?</h3>
        <p>
          No problem. Enter the email address associated with your Edward account and click the button.
          You'll get an email with a link to log in and change your password.
        </p>
      </div>
      <div class="input">
        <input tabindex="1" class="email-input" v-model="email" placeholder="edward@example.com">
      </div>
      <div class="captcha">
        <Captcha :tabindex="2" @change="setCaptchaResponse" @expire="resetCaptchaResponse" ref="captcha"></Captcha>
      </div>
      <div class="actions" v-if="!emailSent">
        <pulse-loader v-if="saving"></pulse-loader>
        <button v-if="!saving" class="button-green reset-button" @click="reset()">Reset my password</button>
        <p class="error" v-if="error">
          That didn't work. Please check your email address and try again.
        </p>
      </div>
      <div class="success" v-if="emailSent">
        Email sent! Go check your inbox.
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
import Captcha from './captcha.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  components: {
    Captcha,
    PulseLoader
  },
  computed: {
    isTest () {
      return this.email === 'trash@edwardtheapp.com'
    }
  },
  data () {
    return {
      captchaResponse: '',
      email: '',
      error: false,
      saving: false,
      emailSent: false
    }
  },
  methods: {
    reset () {
      this.error = false
      this.saving = true
      authApi.sendResetPasswordLink({
        email: this.email,
        captchaResponse: this.captchaResponse,
        integration: this.isTest
      }).then(() => {
        this.saving = false
        this.emailSent = true
      }, err => {
        this.saving = false
        this.error = true
        this.emailSent = false
        console.error(err)
      })
    },
    resetCaptchaResponse () {
      this.captchaResponse = ''
    },
    setCaptchaResponse (response) {
      this.captchaResponse = response
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

.forgot {
  max-width: 1200px;
  padding: 20px 50px;
  width: 100%;
}

.input {
  margin: 20px 0;
}

.input input {
  width: 300px;
}

.captcha {
  margin-bottom: 12px;
  width: 100%;
}

.success {
  margin: 20px 0;
}

.cancel {
  margin-top: 20px;
}

.error {
  color: red;
}
</style>
