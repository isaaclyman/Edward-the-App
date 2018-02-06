<template>
  <div id="app" class="app" v-if="currentDocument.guid">
    <document-menu></document-menu>
    <div class="app-header">
      <div class="app-header--logo-wrap">
        <img class="app-header--logo" src="../../static/logo.png">
      </div>
      <div class="app-header--menu">
        <main-menu></main-menu>
      </div>
    </div>
    <div class="page">
      <router-view></router-view>
    </div>
  </div>
  <div v-else class="page" >
    <wizard></wizard>
  </div>
</template>

<script>
import DocumentMenu from './shared/documentMenu.vue'
import MainMenu from './shared/mainMenu.vue'
import { SET_DEFAULT_USER, SET_USER, SET_USER_PROMISE } from './shared/user.store'
import userApi from './api/userApi'
import Wizard from './wizard/wizard.vue'

export default {
  beforeCreate () {
    const userPromise = userApi.getUser()
    userPromise.then(user => {
      if (!user.verified) {
        window.location.href = '/auth#/verification'
        return
      }

      this.$store.commit(SET_USER, user)
    }, () => {
      this.$store.commit(SET_DEFAULT_USER)
    })

    this.$store.commit(SET_USER_PROMISE, userPromise)
  },
  components: {
    DocumentMenu,
    MainMenu,
    Wizard
  },
  computed: {
    currentDocument () {
      return this.$store.state.document.currentDocument || { guid: null }
    }
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  background-color: #FFF;
  box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.11);
  display: flex;
  height: 60px;
  width: 100%;
}

.app-header--menu {
  display: flex;
  flex: 1;
  height: 100%;
}

.app-header--logo-wrap {
  align-items: center;
  color: #FFF;
  display: flex;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 22px;
  height: 100%;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
}

.app-header--logo {
  height: 28px;
}

.page {
  display: flex;
  flex: 1;
  max-height: calc(100% - 62px);
  padding: 14px 14px;
}

.tooltip {
  color: #FFF;
  cursor: default;
  font-size: 16px;
}

.tooltip a {
  color: #CCC;
}
</style>
