<template>
  <div class="wrap">
    <div class="account">
      <h1 class="type">
        My Account
      </h1>
      <p
        class="thanks" 
        v-if="isPremium"
      >
        You have {{ accountTypeWithArticle }}. Thanks for supporting Edward the App!
      </p>
      <p
        class="thanks"
        v-else
      >
        You have {{ accountTypeWithArticle }}.
      </p>
    </div>
    <div class="upgrade">
      <div v-if="isGold">
        <p class="above-small">
          Don't want your Bestseller account any more?
        </p>
        <p class="small">
          Please back up all of your documents first.
        </p>
        <button @click="goldToPremium()">
          Revert to Author
        </button>
      </div>
      <div v-if="!isPremium">
        <p class="above-small">
          Have you considered upgrading to an Author account?
          An Author account gives you premium storage space on our secure cloud servers, accessible from anywhere.
        </p>
        <p class="price">
          ($7.99 per month, up to 10,000 pages)
        </p>
        <button 
          class="button-green" 
          @click="limitedToPremium()"
        >
          Upgrade to Author
        </button>
      </div>
      <div v-if="!isGold">
        <p class="above-small">
          Have you considered upgrading to a Bestseller account for extra premium storage space?
        </p>
        <p class="price">
          ($14.99 per month, up to 125,000 pages)
        </p>
        <button 
          class="button-small button-gold" 
          @click="toGold()"
        >
          Upgrade to Bestseller
        </button>
      </div>
      <div v-if="isPremium">
        <p class="above-small">
          Don't need secure cloud storage or syncing with your other devices?
        </p>
        <p
          class="small"
        >
          Please back up all of your documents first. They may not fit in your browser's storage.
        </p>
        <button
          class="button-small"
          @click="paidToLimited()"
        >
          Downgrade to Dreamer
        </button>
      </div>
      <div 
        class="error" 
        v-if="error"
      >
        There has been a critical error.
        <strong>Your account change was not successful.</strong>
        Please try again or contact support at
        <a
          href="mailto:support@edwardtheapp.com"
        >support@edwardtheapp.com</a>.
      </div>
    </div>
    <hr
      class="divider"
      v-if="isPremium"
    >
    <div 
      class="payment" 
      v-if="isPremium"
    >
      <p v-if="!isOverdue && paymentDueDate">
        Your next payment is due on {{ paymentDueDate }}.
      </p>
      <p
        class="error"
        v-if="isOverdue"
      >
        Your account is overdue. You cannot access the app until you downgrade to a Dreamer account or make a successful payment.
      </p>
      <button
        class="button-small"
        @click="updatePayment()"
      >
        Update Payment Method
      </button>
    </div>
    <hr class="divider">
    <div class="credentials">
      <h4>Update email address</h4>
      <div class="change-email">
        <input 
          class="account-input" 
          v-model="account.email" 
          :disabled="!editingEmail"
        >
        <button 
          class="button-small button-link" 
          v-if="!editingEmail" 
          @click="editEmail()"
        >
          Edit
        </button>
        <button 
          class="button-small button-link" 
          v-if="editingEmail" 
          @click="cancelEditEmail()"
        >
          Cancel
        </button>
        <button 
          class="button-small button-green" 
          @click="saveEmail()" 
          :disabled="!editingEmail"
        >
          Save
        </button>
      </div>
      <h4>Update password</h4>
      <div class="change-password">
        <input
          class="account-input"
          type="password"
          v-model="account.password"
          :disabled="!editingPassword"
        >
        <button 
          class="button-small button-link" 
          v-if="!editingPassword" 
          @click="editPassword()"
        >
          Edit
        </button>
        <button 
          class="button-small button-link" 
          v-if="editingPassword" 
          @click="cancelEditPassword()"
        >
          Cancel
        </button>
        <button 
          class="button-small button-green" 
          @click="savePassword()" 
          :disabled="!editingPassword"
        >
          Save
        </button>
      </div>
    </div>
    <hr class="divider">
    <div class="delete">
      <p>
        Want to permanently delete your account? Remember, you can always contact us at
        <a href="mailto:support@edwardtheapp.com">support@edwardtheapp.com</a>
        if something has gone wrong.
      </p>
      <router-link to="/delete-account">
        <button class="button-small">
          Delete my account
        </button>
      </router-link>
    </div>
    <hr class="divider">
    <div class="cancel">
      <pulse-loader v-if="saving" />
      <button 
        class="button-small button-green"
        @click="cancel()" 
        :disabled="saving"
      >
        Back to the app
      </button>
    </div>
  </div>
</template>

<script>
import api from '../app/api/api'
import authApi from './authApi'
import accountTypes from '../../models/accountType'
import iconSmall from '../../public/img/edward-favicon_196.png'
import { goToApp } from './shared'
import LocalStorageApi from '../app/api/localStorage'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import swal from 'sweetalert'

const accountPayments = {
  [accountTypes.LIMITED.name]: {
    display: 'Edward Dreamer monthly subscription',
    amount: 0
  },
  [accountTypes.PREMIUM.name]: {
    display: 'Edward Author monthly subscription',
    amount: 799
  },
  [accountTypes.GOLD.name]: {
    display: 'Edward Bestseller monthly subscription',
    amount: 1499
  }
}

const mockPassword = '************'

export default {
  created() {
    if (
      !this.user ||
      !this.user.accountType ||
      this.user.accountType.name === accountTypes.DEMO.name
    ) {
      this.$router.push('/login')
    }
    this.storage = new LocalStorageApi(this.user.email)
  },
  components: {
    PulseLoader
  },
  computed: {
    accountType() {
      return this.user.accountType.displayName
    },
    accountTypeWithArticle() {
      if (this.accountType.toLowerCase().startsWith('a')) {
        return `an ${this.accountType}`
      }

      return `a ${this.accountType}`
    },
    isGold() {
      return this.user.accountType.name === 'GOLD'
    },
    isOverdue() {
      return this.user.isOverdue
    },
    isPremium() {
      return this.user.isPremium
    },
    paymentDueDate() {
      return this.user.paymentDue
        ? new Date(this.user.paymentDue).toLocaleDateString()
        : null
    },
    user() {
      const record = this.$route.matched.find(
        record => record && record.meta && record.meta.getCurrentUser
      )
      return record.meta.getCurrentUser()
    }
  },
  data() {
    return {
      account: {
        email: '',
        password: mockPassword
      },
      editingEmail: false,
      editingPassword: false,
      error: false,
      payment: null,
      saving: false,
      storage: null
    }
  },
  methods: {
    cancel() {
      goToApp()
    },
    limitedToPremium() {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.PREMIUM.display,
        amount: accountPayments.PREMIUM.amount,
        token: token => {
          this.error = false
          this.saving = true
          authApi
            .upgrade({
              oldAccountType: accountTypes.LIMITED.name,
              newAccountType: accountTypes.PREMIUM.name,
              token
            })
            .then(() => this.storage.getFullExport())
            .then(exported => api.fullImport(exported))
            .then(
              () => {
                this.error = false
                this.saving = false
                this.showSuccessPage()
              },
              err => {
                console.error(err)
                this.error = true
                this.saving = false
              }
            )
        }
      })
    },
    limitedToGold() {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.GOLD.display,
        amount: accountPayments.GOLD.amount,
        token: token => {
          this.error = false
          this.saving = true
          authApi
            .upgrade({
              oldAccountType: accountTypes.LIMITED.name,
              newAccountType: accountTypes.GOLD.name,
              token
            })
            .then(() => this.storage.getFullExport())
            .then(exported => api.fullImport(exported))
            .then(
              () => {
                this.error = false
                this.saving = false
                this.showSuccessPage()
              },
              err => {
                console.error(err)
                this.error = true
                this.saving = false
              }
            )
        }
      })
    },
    toGold() {
      // We could be going from limited OR premium to gold
      const userType = this.user.accountType.name
      if (userType === accountTypes.LIMITED.name) {
        return this.limitedToGold()
      } else if (userType === accountTypes.PREMIUM.name) {
        return this.premiumToGold()
      }
    },
    premiumToGold() {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.GOLD.display,
        amount: accountPayments.GOLD.amount,
        token: token => {
          this.error = false
          this.saving = true
          authApi
            .upgrade({
              oldAccountType: accountTypes.PREMIUM.name,
              newAccountType: accountTypes.GOLD.name,
              token
            })
            .then(
              () => {
                this.error = false
                this.saving = false
                this.showSuccessPage()
              },
              err => {
                console.error(err)
                this.error = true
                this.saving = false
              }
            )
        }
      })
    },
    paidToLimited() {
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text:
          'Do you want to downgrade to a Dreamer account? You\'ll lose access to your documents on all other computers, and your data will be deleted if it exceeds the space your browser allows. Author-only content (like workshops) will be lost.',
        title: 'Downgrade to Dreamer account?'
      }).then(willDowngrade => {
        if (!willDowngrade) {
          return
        }

        this.error = false
        this.saving = true

        api
          .fullExport()
          .then(exported => this.storage.doFullImport(exported))
          .then(() =>
            authApi.upgrade({
              oldAccountType: this.user.accountType.name,
              newAccountType: accountTypes.LIMITED.name
            })
          )
          .then(
            () => {
              this.error = false
              this.saving = false
              this.showSuccessPage()
            },
            err => {
              console.error(err)
              this.error = true
              this.saving = false
            }
          )
      })
    },
    goldToPremium() {
      this.payment.open({
        email: this.user.email,
        description: accountPayments.PREMIUM.display,
        amount: accountPayments.PREMIUM.amount,
        token: token => {
          this.error = false
          this.saving = true

          authApi
            .upgrade({
              oldAccountType: accountTypes.GOLD.name,
              newAccountType: accountTypes.PREMIUM.name,
              token
            })
            .then(
              () => {
                this.error = false
                this.saving = false
                this.showSuccessPage()
              },
              err => {
                console.error(err)
                this.error = true
                this.saving = false
              }
            )
        }
      })
    },
    showSuccessPage() {
      this.$router.push('/success')
    },
    updatePayment() {
      const paymentData = accountPayments[this.user.accountType.name]

      this.payment.open({
        email: this.user.email,
        description: paymentData.display,
        amount: paymentData.amount,
        token: token => {
          this.error = false
          this.saving = true

          authApi.updatePayment({ token }).then(
            () => {
              this.error = false
              this.saving = false
              this.showSuccessPage()
            },
            err => {
              console.error(err)
              this.error = true
              this.saving = false
            }
          )
        }
      })
    },
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
      swal({
        buttons: true,
        dangerMode: true,
        icon: 'warning',
        text:
          'Are you sure you want to change your email address? You will have to verify the new address before you can access your account.',
        title: 'Change email and re-verify?'
      }).then(willChange => {
        if (!willChange) {
          return
        }

        authApi.updateEmail(this.account.email).then(
          () => {
            this.editingEmail = false
            window.location.href = '/auth#/verification'
          },
          err => {
            console.error(err)
          }
        )
      })
    },
    savePassword() {
      authApi.updatePassword(this.account.password)
      this.editingPassword = false
    }
  },
  mounted() {
    this.payment = window.StripeCheckout.configure({
      key: window.stripePublicKey,
      image: iconSmall,
      color: 'white',
      locale: 'auto',
      name: 'Novelist LLC',
      zipCode: true,
      allowRememberMe: false
    })

    this.account.email = this.user.email
  },
  destroyed() {
    this.payment.close()
  }
}
</script>

<style scoped>
h1 {
  color: #00866F;
}

hr {
  margin: 8px 0;
  width: 100%;
}

.wrap {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.payment {
  margin-bottom: 20px;
}

.upgrade {
  margin-bottom: 20px;
}

.price {
  font-size: 12px;
  margin: 0 0 4px 0;
}

.above-small {
  margin-bottom: 0;
}

.small {
  color: #DA0000;
  font-size: 10px;
  margin: 0 0 4px 0;
}

.cancel {
  margin: 12px 0;
  text-align: center;
}

.error {
  color: #DA0000;
  margin: 8px 0;
}

.credentials {
  padding-bottom: 20px;
}

.credentials h4 {
  margin: 0;
  margin-top: 20px;
  padding: 0;
}

.account-input {
  min-width: 250px;
}

.delete {
  margin-bottom: 16px;
}
</style>
