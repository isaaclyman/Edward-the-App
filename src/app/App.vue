<template>
  <idle-watcher>
    <transition name="wrapper" mode="out-in">
      <div id="app" class="app" v-if="loaded && currentDocument && currentDocument.guid" key="app">
        <document-menu></document-menu>
        <div class="app-header">
          <div class="logo-wrap">
            <img class="logo" src="../../static/logo.png">
          </div>
          <div class="app-header--menu">
            <main-menu></main-menu>
          </div>
        </div>
        <div class="page">
          <transition name="wrapper" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
      </div>
      <div v-else-if="!loaded" class="loading" key="loading">
        <img class="logo" src="../../static/logo.png">
        <pulse-loader></pulse-loader>
      </div>
      <div v-else class="page" key="wizard">
        <wizard></wizard>
      </div>
    </transition>
  </idle-watcher>
</template>

<script>
import Cache from './shared/cache'
import DocumentMenu from './shared/documentMenu.vue'
import IdleWatcher from './IdleWatcher.vue'
import { INIT_DOCUMENTS } from './shared/document.store'
import MainMenu from './shared/mainMenu.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { SET_DEFAULT_USER, SET_USER, SET_USER_PROMISE } from './shared/user.store'
import userApi from './api/userApi'
import Wizard from './wizard/wizard.vue'

const userCache = new Cache('CURRENT_USER')

export default {
  beforeCreate () {
    const userPromise = userApi.getUser()
    const safeUserPromise = userPromise.then(user => {
      if (!user.verified) {
        window.location.href = '/auth#/verification'
        return
      }

      userCache.cacheSet(user)
      this.$store.commit(SET_USER, user)
      return user
    }, () => {
      const cachedUser = userCache.cacheGet()
      if (cachedUser) {
        this.$store.commit(SET_USER, cachedUser)
        return cachedUser
      }

      this.$store.commit(SET_DEFAULT_USER)
      return this.$store.state.user.user
    })

    this.$store.commit(SET_USER_PROMISE, safeUserPromise)
  },
  created () {
    this.$store.dispatch(INIT_DOCUMENTS).then(() => {
      this.loaded = true
    }, err => {
      console.error(err)
      this.loaded = true
    })

    let routeTransitionTimeout = null

    this.$router.beforeEach((to, from, next) => {
      clearTimeout(routeTransitionTimeout)
      routeTransitionTimeout = setTimeout(() => {
        this.loaded = false
      }, 800)
      next()
    })

    this.$router.afterEach((to, from) => {
      clearTimeout(routeTransitionTimeout)
      this.loaded = true
    })

    this.$router.onError(() => {
      clearTimeout(routeTransitionTimeout)
      this.loaded = true
    })
  },
  components: {
    DocumentMenu,
    IdleWatcher,
    MainMenu,
    PulseLoader,
    Wizard
  },
  computed: {
    currentDocument () {
      return this.$store.state.document.currentDocument
    }
  },
  data () {
    return {
      loaded: false
    }
  }
}
</script>

<style scoped>
.wrapper-enter-active, .wrapper-leave-active {
  transition: opacity 50ms;
}

.wrapper-enter, .wrapper-leave-to {
  opacity: 0;
  pointer-events: none;
}

.wrapper-enter-to, .wrapper-leave {
  opacity: 1;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background-color: #FFF;
  box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.11);
  display: flex;
  height: 60px;
  width: 100%;
  z-index: 50;
}

.app-header--menu {
  display: flex;
  flex: 1;
  height: 100%;
}

.logo-wrap {
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

.logo {
  height: 28px;
}

@media (max-width: 800px) {
  .logo-wrap {
    padding-left: 12px;
    padding-right: 4px;
  }

  .logo-wrap .logo {
    height: 14px;
  }
}

.loading {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

.page {
  display: flex;
  flex: 1;
  max-height: calc(100% - 62px);
  overflow: auto;
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
