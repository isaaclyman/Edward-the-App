<template>
  <div class="wrap">
    <div class="warning">
      <h1>Just so you know...</h1>
      <p>
        <strong>This is a limited account.</strong> When you use a limited account, you should know that:
      </p>
      <ul>
        <li>
          <strong>Your documents are not private.</strong> Anyone with access to this computer can see and edit them.
        </li>
        <li>
          <strong>Your documents are not safe.</strong> If you reinstall your browser, clear your browsing data, or wipe your hard drive, all your work will be deleted. If you exceed the storage space your browser allows, it will erase all your data without warning.
        </li>
      </ul>
      <p>
        Limited accounts are not intended for long-term or serious use, but you can use yours for as long as you want and export as many novels as you want.
        <router-link to="/account">
          <strong>Or upgrade to a Premium account</strong>
        </router-link>
        to get instant, permanent storage on our servers. It's only $2.46 per month.
      </p>
    </div>
    <div class="fill"></div>
    <div class="actions">
      <button class="continue-button button-green" @click="noPremium()">
        Continue to the app
      </button>
      <router-link to="/account">
        <button class="button-link">
          Upgrade to a Premium account
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  computed: {
    user () {
      const meta = this.$route.matched.find(record => record.meta.getCurrentUser).meta
      return meta.getCurrentUser()
    }
  },
  created () {
    if (this.user.isPremium) {
      goToApp()
    }
  },
  data () {
    return {}
  },
  methods: {
    noPremium () {
      goToApp()
    }
  },
  props: {}
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.warning {
  padding: 0 50px;
}

ul {
  padding-left: 6px;
}

.fill {
  flex: 1;
}

.actions {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 12px 0;
  width: 300px;
}

.continue-button {
  margin-bottom: 8px;
}
</style>
