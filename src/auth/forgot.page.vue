<template>
  <div class="wrap">
    <div class="message">
      <h3>Forgot your password?</h3>
      <p>
        No problem. Enter your account email and click the Reset button.
        We'll email you a link to change your password.
      </p>
    </div>
    <div class="input">
      <input 
        tabindex="1" 
        class="email-input" 
        v-model.trim="email" 
        placeholder="Type your email here">
    </div>
    <div class="captcha">
      <Captcha 
        :tabindex="2" 
        @change="setCaptchaResponse" 
        @expire="resetCaptchaResponse" 
        ref="captcha"/>
    </div>
    <div 
      class="actions" 
      v-if="!emailSent">
      <pulse-loader v-if="saving"/>
      <button 
        tabindex="3" 
        v-if="!saving" 
        class="button-green reset-button" 
        @click="reset()">Reset my password</button>
      <p 
        class="error" 
        v-if="error">
        {{ error }}
      </p>
    </div>
    <div 
      class="success" 
      v-if="emailSent">
      Email sent! Go check your inbox.
    </div>
    <div class="cancel">
      <router-link to="/login">
        <button 
          tabindex="4" 
          class="button-link">Back to login</button>
      </router-link>
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
    PulseLoader,
  },
  computed: {
    isTest() {
      return this.email === 'trash@edwardtheapp.com'
    },
  },
  data() {
    return {
      captchaResponse: '',
      email: '',
      error: '',
      saving: false,
      emailSent: false,
    }
  },
  methods: {
    reset() {
      if (!this.email) {
        this.error = 'Please enter a valid email address.'
        return
      }

      if (!this.captchaResponse) {
        this.error = 'Please indicate that you are not a robot.'
        return
      }

      this.error = ''
      this.saving = true
      authApi.sendResetPasswordLink({
        email: this.email,
        captchaResponse: this.captchaResponse,
        integration: this.isTest,
      }).then(() => {
        this.saving = false
        this.emailSent = true
      }, (err) => {
        this.saving = false
        this.$refs.captcha.reset()
        this.error = `That didn't work. Please check your email address and try again.`
        this.emailSent = false
        console.error(err)
      })
    },
    resetCaptchaResponse() {
      this.captchaResponse = ''
    },
    setCaptchaResponse(response) {
      this.captchaResponse = response
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
}

h3 {
  font-size: 34px;
  font-weight: normal;
  margin-bottom: 32px;
  margin-top: 0;
}

p {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 32px;
  margin-top: 0;
}

.input {
  margin-bottom: 32px;
  margin-top: 0;
  width: 100%;
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

.captcha {
  margin-bottom: 32px;
  width: 100%;
}

.success {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.cancel {
  margin-top: 29px;
}

.cancel button {
  padding: 3px 0;
}

.error {
  color: #DA0000;
  margin-bottom: 0;
  margin-top: 32px;
}
</style>
