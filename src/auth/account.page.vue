<template>
  <div class="wrap">
    <div class="account">
      <h1 class="type">You have a {{accountType}}.</h1>
      <h4 class="thanks" v-if="isPremium">Thanks for supporting Edward!</h4>
    </div>
    <hr v-if="isPremium">
    <div class="payment" v-if="isPremium">
      <p class="error" v-if="isOverdue">
        Your account is overdue. You cannot access the app until you downgrade to a Limited account or make a successful payment.
      </p>
      <p>
        Click here to update your payment method.
      </p>
      <button @click="updatePayment()">
        Update Payment Method
      </button>
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
          Upgrade to a Premium account to access your novels from anywhere. ($2.46 per month)
        </p>
        <button class="button-green" @click="limitedToPremium()">
          Go Premium
        </button>
      </div>
      <div v-if="!isGold">
        <p>
          Upgrade to a Gold account for extra Premium storage space. ($10 per month)
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
          Please back up all of your documents first. They may not fit in your browser's storage.
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
      <pulse-loader v-if="saving"></pulse-loader>
      <button class="button-link" @click="cancel()" :disabled="saving">
        Go back to the app
      </button>
    </div>
  </div>
</template>

<script>
import api from '../app/api/api'
import authApi from './authApi'
import accountTypes from '../../models/accountType'
import iconSmall from '../../static/icon-small.png'
import { goToApp } from './shared'
import LocalStorageApi from '../app/api/localStorage'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import swal from 'sweetalert'
const storage = new LocalStorageApi()

const accountPayments = {
  [accountTypes.LIMITED.name]: { display: 'Edward Limited monthly subscription', amount: 0 },
  [accountTypes.PREMIUM.name]: { display: 'Edward Premium monthly subscription', amount: 246 },
  [accountTypes.GOLD.name]: { display: 'Edward Gold monthly subscription', amount: 1000 }
}

export default {
  components: {
    PulseLoader
  },
  computed: {
    accountType () {
      return this.user.accountType.displayName
    },
    isGold () {
      return this.user.accountType.name === 'GOLD'
    },
    isOverdue () {
      return this.user.isOverdue
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
      payment: null,
      saving: false
    }
  },
  methods: {
    cancel () {
      goToApp()
    },
    limitedToPremium () {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.PREMIUM.display,
        amount: accountPayments.PREMIUM.amount,
        token: function (token) {
          this.error = false
          this.saving = true
          authApi.upgrade({
            oldAccountType: accountTypes.LIMITED.name,
            newAccountType: accountTypes.PREMIUM.name,
            token
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
        }
      })
    },
    limitedToGold () {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.GOLD.display,
        amount: accountPayments.GOLD.amount,
        token: function (token) {
          this.error = false
          this.saving = true
          authApi.upgrade({
            oldAccountType: accountTypes.LIMITED.name,
            newAccountType: accountTypes.GOLD.name,
            token
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
        }
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
      this.payment.open({
        email: this.user.email,
        description: accountPayments.GOLD.display,
        amount: accountPayments.GOLD.amount,
        token: function (token) {
          this.error = false
          this.saving = true
          authApi.upgrade({
            oldAccountType: accountTypes.PREMIUM.name,
            newAccountType: accountTypes.GOLD.name,
            token
          }).then(() => {
            this.error = false
            this.saving = false
            this.showSuccessPage()
          }, err => {
            console.error(err)
            this.error = true
            this.saving = false
          })
        }
      })
    },
    paidToLimited () {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text: `Do you want to revert to a Limited account? You'll lose access to your documents on all other computers, and your data will be deleted if it exceeds the space your browser allows.`,
        title: 'Downgrade to Limited account?'
      }).then((willDowngrade) => {
        if (!willDowngrade) {
          return
        }

        this.error = false
        this.saving = true

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
      })
    },
    goldToPremium () {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.PREMIUM.display,
        amount: accountPayments.PREMIUM.amount,
        token: function (token) {
          this.error = false
          this.saving = true

          authApi.upgrade({
            oldAccountType: accountTypes.GOLD.name,
            newAccountType: accountTypes.PREMIUM.name,
            token
          }).then(() => {
            this.error = false
            this.saving = false
            this.showSuccessPage()
          }, err => {
            console.error(err)
            this.error = true
            this.saving = false
          })
        }
      })
    },
    showSuccessPage () {
      this.$router.push('/success')
    },
    updatePayment () {
      const paymentData = accountPayments[this.user.accountType.name]

      this.payment.open({
        email: this.user.email,
        description: paymentData.display,
        amount: paymentData.amount,
        token: function (token) {
          this.error = false
          this.saving = true

          authApi.updatePayment({ token }).then(() => {
            this.error = false
            this.saving = false
            this.showSuccessPage()
          }, err => {
            console.error(err)
            this.error = true
            this.saving = false
          })
        }
      })
    }
  },
  mounted () {
    this.payment = window.StripeCheckout.configure({
      key: window.stripePublicKey,
      image: iconSmall,
      color: 'white',
      locale: 'auto',
      name: 'Novelist LLC',
      zipCode: true,
      allowRememberMe: false
    })
  },
  destroyed () {
    this.payment.close()
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

.account, .payment, .upgrade {
  max-width: 1200px;
  padding: 0 50px;
  width: 100%;
}

.payment {
  margin-bottom: 20px;
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
