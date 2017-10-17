<template>
  <div class="wrap">
    <p class="signup-message">
      <strong>Your Sidebar Hobbyist account is free. You can use it for as long as you like.</strong>
    </p>
    <div class="signup-section">
      <div class="signup-field">
        <label class="signup-label" for="signup-email">Email address:</label>
        <input class="signup-input" :class="{ 'invalid': warnEmail }" id="signup-email" type="text"
               v-model.trim="email" placeholder="greg@example.com">
      </div>
      <button class="field-info" :class="{ 'invalid': warnEmail }" v-html="infoSvg" ref="emailInfo"
              :title="emailInfo"></button>
    </div>
    <div class="signup-section">
      <div class="signup-field">
        <label class="signup-label" for="signup-password">Password:</label>
        <input class="signup-input" :class="{ 'invalid': warnPassword }" id="signup-password" type="password"
               v-model="password">
      </div>
      <button class="field-info" :class="{ 'invalid': warnPassword }" v-html="infoSvg" ref="passwordInfo"
              :title="passwordInfo"></button>
    </div>
    <div class="signup-section">
      <div class="signup-field">
        <label class="signup-label" for="signup-about">Tell us something about yourself, if you'd like:</label>
        <textarea class="signup-textarea" id="signup-about" type="text" v-model="about"></textarea>
      </div>
      <button class="field-info" v-html="infoSvg" ref="aboutInfo" :title="aboutInfo"></button>
    </div>
    <div class="message">
      <p class="message-text">{{ message }}</p>
    </div>
    <div class="actions">
      <button class="button-green" @click="submit()" :disabled="!canSignUp">Create account</button>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import { goToApp } from './shared'
import Octicons from 'octicons'
import tippy from 'tippy.js'

const emailRegex = /^.+@.+$/

export default {
  computed: {
    canSignUp () {
      return (
        !!this.email.trim() &&
        this.validPassword
      )
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
      email: '',
      emailInfo: `We won't email you unless it's important.`,
      infoSvg: Octicons.info.toSVG({
        height: 14,
        width: 14
      }),
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
    submit () {
      this.message = ''

      authApi.signUp({
        about: this.about,
        email: this.email,
        password: this.password
      }).then(result => {
        goToApp()
      }, () => {
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
}

.message-text {
  font-size: 12px;
  margin: 0;
}
</style>
