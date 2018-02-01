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
        <button @click="revertPremium()">
          Revert to Premium
        </button>
      </div>
      <div v-if="!isPremium">
        <p>
          Upgrade to a Premium account to access your novels from anywhere.
        </p>
        <router-link to="/gopremium">
          <button class="button-green">
            Go Premium
          </button>
        </router-link>
      </div>
      <div v-if="!isGold">
        <p>
          Upgrade to a Gold account for extra Premium storage space.
        </p>
        <button class="button-gold" @click="goGold()">
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
        <button @click="revertLimited()">
          Revert to Limited
        </button>
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
    return {}
  },
  methods: {
    cancel () {
      goToApp()
    },
    goGold () {
      // GO GOLD
    },
    revertToLimited () {
      // REVERT
    },
    revertToPremium () {
      // REVERT
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
</style>
