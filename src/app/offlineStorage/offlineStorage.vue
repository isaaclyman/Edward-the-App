<template>
  <div>
    <!-- Chrome permissions modal -->
    <div style="display: none">
      <div class="offline-storage" ref="chromePermissionModal">
        <p>
          Edward will work even when you don't have an Internet connection.
          To avoid data loss when offline, you need to grant app-level permissions on this device,
          including push notifications.
        </p>
        <p>
          Do you want to allow this?
        </p>
      </div>
    </div>
    <!-- Firefox/other permissions modal -->
    <div style="display: none">
      <div class="offline-storage" ref="standardPermissionModal">
        <p>
          Edward will work even when you don't have an Internet connection.
          To avoid data loss when offline, you need to give permission to store files on your system.
        </p>
        <p>
          Do you want to allow this?
        </p>
      </div>
    </div>
    <!-- Permission failed modal -->
    <div style="display: none">
      <div class="offline-storage" ref="permissionFailedModal">
        <p>
          Failed to get the required permissions. Edward may still work offline,
          but this could result in data loss.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Cache from '../shared/cache'
import { detect } from 'detect-browser'
import swal from 'sweetalert'

const browser = detect()
const offlineModalSeen = new Cache('OFFLINE_MODAL_SEEN')

function askPermission () {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result)
    })

    if (permissionResult) {
      permissionResult.then(resolve, reject)
    }
  })
  .then(function (permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error('Push notification permission was not granted.')
    }
  })
}

export default {
  computed: {
    isPremium () {
      return this.$store.state.user.user.isPremium
    }
  },
  data () {
    return {
      allowsOffline: true
    }
  },
  methods: {
    checkOfflineStorage () {
      if (navigator.storage && navigator.storage.persisted) {
        navigator.storage.persisted().then(persistent => {
          this.allowsOffline = persistent

          const seen = offlineModalSeen.cacheGet()
          if (!seen && this.isPremium && !persistent) {
            this.promptForPermission()
          }
        })
      }
    },
    chromePrompt () {
      swal({
        content: this.$refs.chromePermissionModal,
        title: 'Offline Permissions',
        buttons: {
          cancel: 'No',
          confirm: 'Yes'
        }
      }).then(allow => {
        offlineModalSeen.cacheSet(true)
        if (allow) {
          askPermission().then(() => {
            return navigator.storage.persist().then(persist => {
              this.allowsOffline = persist
              if (!persist) {
                throw new Error('Could not obtain persistent storage permissions.')
              }
            })
          }, () => {
            this.permissionFailed()
          })
        } else {
          this.allowsOffline = false
        }
      })
    },
    permissionFailed () {
      swal({
        content: this.$refs.permissionFailedModal,
        title: 'Permission not obtained',
        icon: 'error'
      })
    },
    promptForPermission () {
      if (browser && browser.name === 'chrome') {
        return this.chromePrompt()
      }
      return this.standardPrompt()
    },
    standardPrompt () {
      swal({
        content: this.$refs.standardPermissionModal,
        title: 'Offline Permissions',
        buttons: {
          cancel: 'No',
          confirm: 'Yes'
        }
      }).then(allow => {
        offlineModalSeen.cacheSet(true)
        if (allow) {
          navigator.storage.persist().then(persist => {
            this.allowsOffline = persist
            if (!persist) {
              this.permissionFailed()
            }
          })
        } else {
          this.allowsOffline = false
        }
      })
    }
  },
  mounted () {
    this.checkOfflineStorage()
  }
}
</script>

<style scoped>

</style>
