<template>
  <div class="status-wrap" v-if="!isDemo">
    <div class="status">
      <div class="status-saving" :class="{ 'show': isSaving }">
        Saving...
      </div>
      <div class="status-saved" :class="{ 'show': !isSaving && saved }">
        Saved <span v-html="savedIcon"></span>
      </div>
      <div class="status-error" :class="{ 'show': !isSaving && saveError }" :title="saveErrorText" v-tooltip>
        Error <span v-html="errorIcon"></span>
      </div>
      <div class="status-offline" :class="{ 'show': offline }" :title="offlineText" v-tooltip>
        Offline <span v-html="offlineIcon"></span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api/api'
import Octicons from 'octicons'
import { Statuses, SET_STATUS_OFFLINE } from './status.store'
import tooltip from './tooltip.directive'

let offlineInterval

export default {
  created () {
    offlineInterval = setInterval(() => {
      api.isOnline().then(online => {
        // TODO: If previously offline, then upsync to the server
      }, () => {
        this.$store.commit(SET_STATUS_OFFLINE)
      })
    }, 15 * 1000)
  },
  beforeDestroy () {
    clearInterval(offlineInterval)
  },
  computed: {
    accountType () {
      return this.$store.state.user.user.accountType || {}
    },
    isDemo () {
      return this.accountType.name === 'DEMO'
    },
    offline () {
      return this.$store.state.status.status === Statuses.OFFLINE
    },
    saved () {
      return this.$store.state.status.status === Statuses.SAVED
    },
    saving () {
      return this.$store.state.status.status === Statuses.SAVING
    },
    saveError () {
      return this.$store.state.status.status === Statuses.ERROR
    }
  },
  data () {
    return {
      errorIcon: Octicons.alert.toSVG({
        height: 15,
        width: 15
      }),
      isSaving: false,
      offlineIcon: Octicons.plug.toSVG({
        height: 15,
        width: 15
      }),
      offlineText: `No internet connection is available. Your work is saved locally and will be synced up again once you go online.`,
      saveErrorText: `Your work may not be saved. Please check your Internet connection.`,
      savedIcon: Octicons.check.toSVG({
        height: 15,
        width: 15
      }),
      savingDebouncer: window.setTimeout(() => {})
    }
  },
  directives: {
    tooltip
  },
  watch: {
    // A bit of trickery to make the "Saving" indicator show for at least 500ms.
    // This comforts me.
    saving (saving) {
      if (saving) {
        this.isSaving = true
      }

      clearTimeout(this.savingDebouncer)
      this.savingDebouncer = window.setTimeout(() => {
        this.isSaving = this.saving
      }, 500)
    }
  }
}
</script>

<style scoped>
.status-wrap {
  align-items: center;
  display: flex;
  font-size: 17px;
  justify-content: center;
  margin-right: 8px;
}

.status {
  cursor: default;
  height: 20px;
  position: relative;
  text-align: right;
  width: 65px;
}

.status-saving {
  color: rgb(255, 165, 0);
  fill: rgb(255, 165, 0);
}

.status-saved {
  color: rgb(1,171,109);
  fill: rgb(1,171,109);
}

.status-error {
  color: rgb(255, 0, 0);
  fill: rgb(255, 0, 0);
}

.status-offline {
  color: rgb(47, 79, 79);
  fill: rgb(47, 79, 79);
}

.status-saving, .status-saved, .status-error, .status-offline {
  cursor: default;
  opacity: 0;
  position: absolute;
  transition: opacity 500ms;
}

.status-saving.show, .status-saved.show, .status-error.show, .status-offline.show {
  opacity: 1;
}
</style>
