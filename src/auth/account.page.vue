<template>
  <div class="wrap">
    <div class="account">
      <h1 class="type">You have a {{accountType}}.</h1>
      <h4 class="thanks" v-if="isPremium">Thanks for supporting Edward!</h4>
    </div>
    <hr>
    <div class="upgrade">
      <div v-if="isGold">
        <p class="above-small">
          Don't want your Gold account any more?
        </p>
        <p class="small">
          Please back up all of your documents first.
        </p>
        <button @click="goldToPremium()">
          Revert to Premium
        </button>
      </div>
      <div v-if="!isPremium">
        <p>
          Upgrade to a Premium account to access your novels from anywhere.
        </p>
        <button class="button-green" @click="limitedToPremium()">
          Go Premium
        </button>
      </div>
      <div v-if="!isGold">
        <p>
          Upgrade to a Gold account for extra Premium storage space.
        </p>
        <button class="button-gold" @click="toGold()">
          Go Gold
        </button>
      </div>
      <div v-if="isPremium">
        <p class="above-small">
          Want to downgrade to a Limited account?
        </p>
        <p class="small">
          Please back up all of your documents first.
        </p>
        <button @click="paidToLimited()">
          Revert to Limited
        </button>
      </div>
      <div class="error" v-if="error">
        There has been a critical error. <strong>Your account change was not successful.</strong>
        Please try again or contact support at <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>.
      </div>
    </div>
    <div class="cancel">
      <button class="button-link" @click="cancel()">
        Go back to the app
      </button>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'
import LocalStorageApi from '../app/api/localStorage'
const storage = new LocalStorageApi()
import api from '../app/api/api'
import authApi from './authApi'
import accountTypes from '../../models/accountType'

export default {
  computed: {
    accountType () {
      return this.user.accountType.displayName
    },
    isGold () {
      return this.user.accountType.name === 'GOLD'
    },
    isPremium () {
      return this.user.isPremium
    },
    user () {
      const meta = this.$route.matched.find(record => record.meta.getCurrentUser).meta
      return meta.getCurrentUser()
    }
  },
  data () {
    return {
      error: false,
      saving: false
    }
  },
  methods: {
    cancel () {
      goToApp()
    },
    limitedToPremium () {
      this.error = false
      this.saving = true

      authApi.upgrade({
        oldAccountType: accountTypes.LIMITED.name,
        newAccountType: accountTypes.PREMIUM.name
      }).then(() => {
        return storage.getFullExport()
      }).then(exported => {
        return api.fullImport(exported)
      }).then(() => {
        this.error = false
        this.saving = false
        this.showSuccessPage()
      }, err => {
        console.error(err)
        this.error = true
        this.saving = false
      })
    },
    limitedToGold () {
      this.error = false
      this.saving = true

      authApi.upgrade({
        oldAccountType: accountTypes.LIMITED.name,
        newAccountType: accountTypes.GOLD.name
      }).then(() => {
        return storage.getFullExport()
      }).then(exported => {
        return api.fullImport(exported)
      }).then(() => {
        this.error = false
        this.saving = false
        this.showSuccessPage()
      }, err => {
        console.error(err)
        this.error = true
        this.saving = false
      })
    },
    toGold () {
      // We could be going from limited OR premium to gold
      const userType = this.user.accountType.name
      if (userType === accountTypes.LIMITED.name) {
        return this.limitedToGold()
      } else if (userType === accountTypes.PREMIUM.name) {
        return this.premiumToGold()
      }
    },
    premiumToGold () {
      this.error = false
      this.saving = true

      authApi.upgrade({
        oldAccountType: accountTypes.PREMIUM.name,
        newAccountType: accountTypes.GOLD.name
      }).then(() => {
        this.error = false
        this.saving = false
        this.showSuccessPage()
      }, err => {
        console.error(err)
        this.error = true
        this.saving = false
      })
    },
    paidToLimited () {
      this.error = false
      this.saving = true

      // SHOW WARNING: your stuff may not fit

      api.fullExport().then(exported => {
        return storage.doFullImport(exported)
      }).then(() => {
        return authApi.upgrade({
          oldAccountType: this.user.accountType.name,
          newAccountType: accountTypes.LIMITED.name
        })
      }).then(() => {
        this.error = false
        this.saving = false
        this.showSuccessPage()
      }, err => {
        console.error(err)
        this.error = true
        this.saving = false
      })
    },
    goldToPremium () {
      authApi.upgrade({
        oldAccountType: accountTypes.GOLD.name,
        newAccountType: accountTypes.PREMIUM.name
      }).then(() => {
        this.error = false
        this.saving = false
        this.showSuccessPage()
      }, err => {
        console.error(err)
        this.error = true
        this.saving = false
      })
    },
    showSuccessPage () {
      this.$router.push('/success')
    }
  }
}
</script>

<style scoped>
hr {
  margin: 8px 0;
  width: 100%;
}

.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.account, .upgrade {
  padding: 0 50px;
  width: 100%;
}

.above-small {
  margin-bottom: 0;
}

.small {
  color: red;
  font-size: 10px;
  margin: 0 0 4px 0;
}

.cancel {
  margin: 12px 0;
  text-align: center;
}

.error {
  color: red;
  margin: 8px 0;
}
</style>
