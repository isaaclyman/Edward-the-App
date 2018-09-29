<template>
  <div class="menu">
    <div class="menu-item">
      <document-picker/>
    </div>
    <div class="menu-item">
      <router-link to="/documentEdit">
        <button class="menu-button">
          Edit
        </button>
      </router-link>
      <router-link to="/export">
        <button 
          class="menu-button mobile-hide" 
          :disabled="!isOnline">
          Download / Upload
        </button>
      </router-link>
      <hr class="vert-flex">
      <button 
        class="menu-button" 
        @click="showWizard()" 
        :disabled="!isOnline">
        New
      </button>
    </div>
    <div class="spacer"/>
    <div 
      class="menu-item" 
      v-if="notDemo">
      <router-link to="/settings">
        <button 
          class="menu-button mobile-hide" 
          :disabled="!isOnline">
          Settings
        </button>
      </router-link>
      <a href="/auth#/account">
        <button 
          class="menu-button button-green mobile-hide" 
          :disabled="!isOnline">
          Upgrade
        </button>
      </a>
    </div>
    <div 
      class="menu-item" 
      v-if="!notDemo">
      <a href="/auth#/signup">
        <button 
          class="menu-button button-green mobile-hide" 
          :disabled="!isOnline">
          Upgrade
        </button>
      </a>
    </div>
    <div class="menu-item">
      <button 
        class="menu-button" 
        @click="logOut()" 
        :disabled="!isOnline">
        Log Out
      </button>
    </div>
  </div>
</template>

<script>
import DocumentPicker from './documentPicker.vue'
import { Statuses } from './status.store'
import swal from 'sweetalert'
import { UNLOAD_CURRENT_DOCUMENT } from './document.store'
import userApi from '../api/userApi'

export default {
  components: {
    DocumentPicker,
  },
  computed: {
    isOnline() {
      return this.$store.state.status.status !== Statuses.OFFLINE
    },
    notDemo() {
      return this.$store.state.user.user.accountType.name !== 'DEMO'
    },
  },
  data() {
    return {}
  },
  methods: {
    logOut() {
      userApi.logOut().then(() => {
        window.location.href = '/auth'
      }, () => {
        swal({
          icon: 'error',
          text: 'Sorry, logout failed. If security is a concern, please clear your cookies and other browsing data and close your browser.',
        })
      })
    },
    showWizard() {
      this.$store.dispatch(UNLOAD_CURRENT_DOCUMENT)
    },
  },
}
</script>

<style scoped>
.menu {
  align-items: center;
  background-color: #444;
  display: flex;
  flex-direction: row;
  height: 30px;
  padding: 2px 30px;
}

.menu-item {
  color: #FFF;
  margin: 3px 0;
  margin-right: 20px;
}

.menu-button {
  color: #FFF;
  margin: 0 2px;
  padding: 3px 10px;
}

.spacer {
  flex: 1;
}
</style>
