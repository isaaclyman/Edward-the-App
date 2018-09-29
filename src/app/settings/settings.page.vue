<template>
  <div class="wrap">
    <div class="settings">
      <div class="title">
        <h3>Settings</h3>
      </div>
      <hr>
      <h4>Email</h4>
      <div class="change-email">
        <input 
          class="account-input" 
          v-model="account.email" 
          :disabled="!editingEmail">
        <button 
          class="button-link" 
          v-if="notDemo && !editingEmail" 
          @click="editEmail()">
          Edit
        </button>
        <button 
          class="button-link" 
          v-if="editingEmail" 
          @click="cancelEditEmail()">
          Cancel
        </button>
        <button 
          class="button-green" 
          v-if="notDemo" 
          @click="saveEmail()" 
          :disabled="!editingEmail">
          Save
        </button>
      </div>
      <div 
        class="error" 
        v-if="error">
        That didn't work. Please try again or contact support.
      </div>
      <hr>
      <h4>Password</h4>
      <div class="change-password">
        <input 
          class="account-input" 
          type="password" 
          v-model="account.password" 
          :disabled="!editingPassword">
        <button 
          class="button-link" 
          v-if="notDemo && !editingPassword" 
          @click="editPassword()">
          Edit
        </button>
        <button 
          class="button-link" 
          v-if="editingPassword" 
          @click="cancelEditPassword()">
          Cancel
        </button>
        <button 
          class="button-green" 
          v-if="notDemo" 
          @click="savePassword()" 
          :disabled="!editingPassword">
          Save
        </button>
      </div>
      <hr>
      <h3>Account Status</h3>
      <div 
        class="account-type" 
        v-if="notDemo">
        <p>You have a {{ accountType }}.</p>
        <p v-if="!isPremium">For a better experience, upgrade to a Premium Account.</p>
        <div class="upgrade-button">
          <a href="/auth#/account">
            <button class="button-green">
              Manage account
            </button>
          </a>
        </div>
      </div>
      <hr>
      <h3>About</h3>
      <div class="about-app">
        <p>Edward was created by <a href="http://isaaclyman.com">Isaac</a>. For updates on new features and Edward-flavored fun, follow the app on Twitter.</p>
        <p>
          <a href="https://twitter.com/edwardtheapp">
            <span 
              class="twitter-icon" 
              v-html="twitterIcon"/>
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { UPDATE_EMAIL, UPDATE_PASSWORD } from '../shared/user.store'
import swal from 'sweetalert'

const mockPassword = '************'
const twitterIcon = '<svg id="Logo_FIXED" data-name="Logo â€” FIXED" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><style>.cls-1{fill:none;}.cls-2{fill:#1da1f2;}</style></defs><title>Twitter_Logo_Blue</title><rect class="cls-1" width="400" height="400"/><path class="cls-2" d="M153.62,301.59c94.34,0,145.94-78.16,145.94-145.94,0-2.22,0-4.43-.15-6.63A104.36,104.36,0,0,0,325,122.47a102.38,102.38,0,0,1-29.46,8.07,51.47,51.47,0,0,0,22.55-28.37,102.79,102.79,0,0,1-32.57,12.45,51.34,51.34,0,0,0-87.41,46.78A145.62,145.62,0,0,1,92.4,107.81a51.33,51.33,0,0,0,15.88,68.47A50.91,50.91,0,0,1,85,169.86c0,.21,0,.43,0,.65a51.31,51.31,0,0,0,41.15,50.28,51.21,51.21,0,0,1-23.16.88,51.35,51.35,0,0,0,47.92,35.62,102.92,102.92,0,0,1-63.7,22A104.41,104.41,0,0,1,75,278.55a145.21,145.21,0,0,0,78.62,23"/></svg>'

export default {
  components: {},
  computed: {
    accountType() {
      return this.user.accountType.displayName
    },
    isPremium() {
      return this.user.isPremium
    },
    notDemo() {
      return this.user.accountType.name !== 'DEMO'
    },
    user() {
      return this.$store.state.user.user
    },
    userPromise() {
      return this.$store.state.user.userPromise
    },
  },
  data() {
    return {
      account: {
        email: '',
        password: mockPassword,
      },
      editingEmail: false,
      editingPassword: false,
      error: false,
      twitterIcon,
    }
  },
  methods: {
    cancelEditEmail() {
      this.editingEmail = false
      this.account.email = this.user.email
    },
    cancelEditPassword() {
      this.editingPassword = false
      this.account.password = mockPassword
    },
    editEmail() {
      this.editingEmail = true
    },
    editPassword() {
      this.editingPassword = true
      this.account.password = ''
    },
    saveEmail() {
      this.error = false
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: 'Are you sure you want to change your email address? You will have to verify the new address before you can access your account.',
        title: 'Change email and re-verify?',
      }).then((willChange) => {
        if (!willChange) {
          return
        }

        this.$store.dispatch(UPDATE_EMAIL, { email: this.account.email }).then(() => {
          this.editingEmail = false
          window.location.href = '/auth#/verification'
        }, (err) => {
          console.error(err)
          this.error = true
        })
      })
    },
    savePassword() {
      this.$store.commit(UPDATE_PASSWORD, { password: this.account.password })
      this.editingPassword = false
    },
  },
  mounted() {
    this.userPromise.then(() => {
      this.account.email = this.user.email
    })
  },
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.settings {
  background-color: #FFF;
  border-radius: 5px;
  box-shadow: 0px -2px 12px -4px rgba(0,0,0,0.75);
  display: block;
  flex: 1;
  max-width: 1050px;
  overflow: auto;
  padding: 15px;
}

.account-input {
  min-width: 250px;
}

.error {
  color: red;
}

.upgrade-button {
  margin-top: 6px;
}

.twitter-icon {
  display: inline-block;
}
</style>

<style>
.twitter-icon svg {
  height: 32px;
}
</style>
