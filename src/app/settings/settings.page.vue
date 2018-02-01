<template>
<div class="wrap">
  <div class="settings">
    <div class="title">
      <h3>Account</h3>
    </div>
    <hr>
    <h4>Email</h4>
    <div class="change-email">
      <input class="account-input" v-model="account.email" :disabled="!editingEmail">
      <button class="button-link" v-if="notDemo && !editingEmail" @click="editEmail()">
        Edit
      </button>
      <button class="button-link" v-if="editingEmail" @click="cancelEditEmail()">
        Cancel
      </button>
      <button class="button-green" v-if="notDemo" @click="saveEmail()" :disabled="!editingEmail">
        Save
      </button>
    </div>
    <hr>
    <h4>Password</h4>
    <div class="change-password">
      <input class="account-input" type="password" v-model="account.password" :disabled="!editingPassword">
      <button class="button-link" v-if="notDemo && !editingPassword" @click="editPassword()">
        Edit
      </button>
      <button class="button-link" v-if="editingPassword" @click="cancelEditPassword()">
        Cancel
      </button>
      <button class="button-green" v-if="notDemo" @click="savePassword()" :disabled="!editingPassword">
        Save
      </button>
    </div>
    <hr>
    <div class="account-type">
      <div>
        You have a {{accountType}}.
        <span v-if="!isPremium">For a better experience, upgrade to a Premium account.</span>
      </div>
      <div class="upgrade-button">
        <button class="button-green" @click="goToUpgrade()">
          Upgrade
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { UPDATE_EMAIL, UPDATE_PASSWORD } from '../shared/user.store'

const mockPassword = '************'

export default {
  components: {},
  computed: {
    accountType () {
      return this.user.accountType.displayName
    },
    isPremium () {
      return this.user.isPremium
    },
    notDemo () {
      return this.user.accountType.name !== 'DEMO'
    },
    user () {
      return this.$store.state.user.user
    },
    userPromise () {
      return this.$store.state.user.userPromise
    }
  },
  data () {
    return {
      account: {
        email: '',
        password: mockPassword
      },
      editingEmail: false,
      editingPassword: false
    }
  },
  methods: {
    cancelEditEmail () {
      this.editingEmail = false
      this.account.email = this.user.email
    },
    cancelEditPassword () {
      this.editingPassword = false
      this.account.password = mockPassword
    },
    editEmail () {
      this.editingEmail = true
    },
    editPassword () {
      this.editingPassword = true
      this.account.password = ''
    },
    goToUpgrade () {
      window.location.href = '/auth#/account'
    },
    saveEmail () {
      this.$store.commit(UPDATE_EMAIL, { email: this.account.email })
      this.editingEmail = false
    },
    savePassword () {
      this.$store.commit(UPDATE_PASSWORD, { password: this.account.password })
      this.editingPassword = false
    }
  },
  mounted () {
    this.userPromise.then(() => {
      this.account.email = this.user.email
    })
  }
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
  padding: 15px;
}

.account-input {
  min-width: 250px;
}

.upgrade-button {
  margin-top: 6px;
}
</style>
