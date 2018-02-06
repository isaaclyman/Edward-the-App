<template>
  <div class="wrap">
    <div class="warning">
      <h1>Just so you know...</h1>
      <p>
        <strong>This is a limited account.</strong>
      </p>
      <p>
        All your novels are stored insecurely on your computer. You won't be able to access it on multiple computers, and it will be deleted if you reinstall your browser, clear your browsing data, or wipe your hard drive. If you exceed the storage space your browser is allowed to use, it may erase all your data without warning.
      </p>
      <p>
        You can use your limited account for as long as you want and export as many novels as you want.
        <router-link to="/gopremium">
          <strong>Or upgrade to a Premium account</strong>
        </router-link>
        to get instant, permanent storage on our servers.
      </p>
    </div>
    <div class="fill"></div>
    <div class="actions">
      <button class="continue-button button-green" @click="noPremium()">
        Continue to the app
      </button>
      <router-link to="/gopremium">
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
  data () {
    return {}
  },
  methods: {
    goPremium () {
      this.$router.push('/gopremium')
    },
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

.fill {
  flex: 1;
}

.actions {
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
