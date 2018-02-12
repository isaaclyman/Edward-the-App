<template>
  <div class="wrap">
    <p class="signup-message">
      <strong>Your Limited account is free. You can use it for as long as you like.</strong>
    </p>
    <div class="signup-section username">
      <div class="signup-field">
        <label class="signup-label" for="signup-email">Email address:</label>
        <input class="signup-input" :class="{ 'invalid': warnEmail }" id="signup-email" type="text"
               v-model.trim="email" placeholder="greg@example.com">
      </div>
      <button class="field-info" :class="{ 'invalid': warnEmail }" v-html="infoSvg" ref="emailInfo"
              :title="emailInfo"></button>
    </div>
    <div class="signup-section password">
      <div class="signup-field">
        <label class="signup-label" for="signup-password">Password:</label>
        <input class="signup-input" :class="{ 'invalid': warnPassword }" id="signup-password" type="password"
               v-model="password">
      </div>
      <button class="field-info" :class="{ 'invalid': warnPassword }" v-html="infoSvg" ref="passwordInfo"
              :title="passwordInfo"></button>
    </div>
    <div class="signup-section about">
      <div class="signup-field">
        <label class="signup-label" for="signup-about">Tell us something about yourself, if you'd like:</label>
        <textarea class="signup-textarea" id="signup-about" type="text" v-model="about"></textarea>
      </div>
      <button class="field-info" v-html="infoSvg" ref="aboutInfo" :title="aboutInfo"></button>
    </div>
    <div class="captcha">
      <Captcha @change="setCaptchaResponse" @expire="resetCaptchaResponse" ref="captcha"></Captcha>
    </div>
    <div class="message">
      <p class="message-text">{{ message }}</p>
    </div>
    <div class="legal">
      Before creating an account, you must read and agree to our
      <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Use.</a>
    </div>
    <div class="actions">
      <pulse-loader v-if="loading"></pulse-loader>
      <button class="button-green" v-if="!loading" @click="submit()" :disabled="!canSignUp">Create account</button>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'
import Octicons from 'octicons'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import tippy from 'tippy.js'

const emailRegex = /^.+@.+$/

export default {
  components: {
    Captcha,
    PulseLoader
  },
  computed: {
    canSignUp () {
      return (
        !!this.email.trim() &&
        this.validPassword
      )
    },
    isTest () {
      return this.email === 'trash@edwardtheapp.com'
    },
    warnEmail () {
      return this.email && !this.validEmail
    },
    warnPassword () {
      return this.password && !this.validPassword
    },
    validEmail () {
      return (
        !!this.email &&
        emailRegex.test(this.email)
      )
    },
    validPassword () {
      return (
        !!this.password &&
        this.password.length >= 12
      )
    }
  },
  data () {
    return {
      about: '',
      aboutInfo: `This field is optional.`,
      captchaResponse: '',
      email: '',
      emailInfo: `We won't email you unless it's important.`,
      infoSvg: Octicons.info.toSVG({
        height: 14,
        width: 14
      }),
      loading: false,
      message: '',
      password: '',
      passwordInfo: `Please choose a long password (12 characters or more).`
    }
  },
  methods: {
    setInfoTooltip (el) {
      tippy(el, {
        arrow: true,
        position: 'top'
      })
    },
    resetCaptchaResponse () {
      this.captchaResponse = ''
    },
    setCaptchaResponse (response) {
      this.captchaResponse = response
    },
    submit () {
      this.message = ''

      if (!this.captchaResponse && !this.isTest) {
        this.message = 'Please indicate that you are not a robot.'
        return
      }

      this.loading = true

      authApi.signUp({
        about: this.about,
        captchaResponse: this.captchaResponse,
        email: this.email,
        password: this.password,
        integration: this.isTest
      }).then(result => {
        this.loading = false
        this.$router.push('/verification')
      }, () => {
        this.loading = false
        this.$refs.captcha.reset()
        this.message = 'Signup failed. Please check your email/password and try again.'
      })
    }
  },
  mounted () {
    this.setInfoTooltip(this.$refs.aboutInfo)
    this.setInfoTooltip(this.$refs.emailInfo)
    this.setInfoTooltip(this.$refs.passwordInfo)
  }
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  padding: 12px;
  width: 100%;
}

.signup-message {
  margin-bottom: 20px;
}

.signup-section {
  display: flex;
  margin-bottom: 12px;
  width: 100%;
}

.signup-field {
  display: flex;
  flex: 1;
}

.signup-label {
  width: 200px;
}

.signup-input {
  flex: 1;
}

.signup-input.invalid {
  border-color: red;
}

.field-info {
  border: none;
  height: 29px;
  width: 29px;
}

.field-info.invalid {
  fill: red;
}

.signup-textarea {
  flex: 1;
  height: 140px;
  resize: none;
}

.message {
  color: red;
  height: 20px;
  margin: 8px 0;
}

.message-text {
  font-size: 12px;
  margin: 0;
}

.legal {
  margin-bottom: 20px;
}
</style>
