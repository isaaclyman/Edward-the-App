<template>
  <div class="menu">
    <div class="menu-item">
      <file-picker></file-picker>
    </div>
    <div class="menu-item">
      <button class="menu-button" @click="showWizard()">
        New
      </button>
      <button class="menu-button" @click="showExport()">
        Export / Import
      </button>
    </div>
    <div class="spacer"></div>
    <div class="menu-item">
      <button class="menu-button" @click="logOut()">
        Log Out
      </button>
    </div>
  </div>
</template>

<script>
import FilePicker from './filePicker.vue'
import swal from 'sweetalert'
import { UNLOAD_CURRENT_DOCUMENT } from './file.store'
import userApi from './userApi'

export default {
  components: {
    FilePicker
  },
  data () {
    return {}
  },
  methods: {
    logOut () {
      userApi.logOut().then(() => {
        window.location.href = '/auth'
      }, () => {
        swal({
          icon: 'error',
          text: `Sorry, logout failed. If security is a concern, please clear your cookies and other browsing data and close your browser.`
        })
      })
    },
    showExport () {
      this.$router.push('/export')
    },
    showWizard () {
      this.$store.dispatch(UNLOAD_CURRENT_DOCUMENT)
    }
  }
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
  padding: 3px 10px;
}

.spacer {
  flex: 1;
}
</style>
