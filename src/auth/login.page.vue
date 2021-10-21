<template>
  <div class="wrap">
    <div class="username">
      <label for="login-username-input">Email</label>
      <input 
        tabindex="1" 
        id="login-username-input" 
        class="login-field" 
        type="text" 
        v-model="email"
        placeholder="Type your email here"
      >
    </div>
    <div class="password">
      <label for="login-password-input">Password</label>
      <input 
        tabindex="2" 
        id="login-password-input" 
        class="login-field" 
        type="password" 
        v-model="password"
        placeholder="Type your password here"
      >
    </div>
    <div class="forgot-password">
      Forgotten your password?
      <router-link to="/forgot">
        <button 
          tabindex="3" 
          class="button-link forgot-button"
        >
          Click here to fix.
        </button>
      </router-link>
    </div>
    <div class="captcha">
      <Captcha 
        :tabindex="4" 
        @change="setCaptchaResponse" 
        @expire="resetCaptchaResponse" 
        ref="captcha"
      />
    </div>
    <div
      v-if="loginMessage"
      class="messages"
    >
      <p>
        <span class="fa fa-exclamation-circle" />
        {{ loginMessage }}
      </p>
    </div>
    <div class="actions">
      <pulse-loader v-if="loading" />
      <button 
        tabindex="5" 
        v-if="!loading" 
        class="login-button button-green" 
        :disabled="!canLogin" 
        @click="logIn()"
      >
        Log In
      </button>
    </div>
    <hr class="divider">
    <div class="sign-up">
      Signups are no longer available.
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'
import { goToApp } from './shared'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  beforeCreate() {
    authApi.logOut()
  },
  components: {
    Captcha,
    PulseLoader,
  },
  computed: {
    canLogin() {
      return (
        !!this.email.trim() &&
        !!this.password.trim()
      )
    },
    isTest() {
      return this.email === 'trash@edwardtheapp.com'
    },
  },
  data() {
    return {
      captchaResponse: '',
      email: '',
      loading: false,
      loginMessage: '',
      password: '',
    }
  },
  methods: {
    logIn() {
      this.loginMessage = ''

      if (!this.captchaResponse && !this.isTest) {
        this.loginMessage = 'Please indicate that you are not a robot.'
        return
      }

      this.loading = true

      authApi.logIn({
        email: this.email,
        password: this.password,
        captchaResponse: this.captchaResponse,
        integration: this.isTest,
      }).then((result) => {
        this.loading = false

        if (!result.verified) {
          this.$router.push('/verification')
        } else if (!result.isPremium) {
          this.$router.push('/limited')
        } else {
          goToApp()
        }
      }, () => {
        this.loading = false
        this.$refs.captcha.reset()
        this.loginMessage = 'One or more of the details you entered are wrong. Please check your responses and try again.'
      })
    },
    resetCaptchaResponse() {
      this.captchaResponse = ''
    },
    setCaptchaResponse(response) {
      this.captchaResponse = response
    },
    signUp() {
      this.$router.push('/signup')
    },
    viewDemo() {
      this.loading = true

      authApi.demoLogIn().then(() => {
        this.loading = false
        goToApp()
      }, () => {
        this.loading = false
        this.loginMessage = 'The demo account isn\'t working right now. Please try again later.'
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
  font-size: 16px;
  justify-content: center;
  margin-bottom: 20px;
}

.sign-up {
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}

.sign-up .button-link {
  padding: 0 3px;
}

.username, .password {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  margin-bottom: 32px;
  width: 100%;
}

.username label, .password label {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: left;
  width: 100%;
}

.username input, .password input {
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

.forgot-password {
  margin-bottom: 32px;
}

.forgot-password, .forgot-password button {
  font-size: 20px;
  font-weight: bold;
  padding: 0 3px;
}

.login-field {
  width: 300px;
}

.captcha {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;
  width: 100%;
}

.messages {
  align-items: center;
  color: #DA0000;
  display: flex;
  font-size: 20px;
  font-weight: bold;
  justify-content: center;
  margin: 0;
  margin-bottom: 32px;
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;
  width: 100%;
}

hr {
  margin-bottom: 32px;
}
</style>
