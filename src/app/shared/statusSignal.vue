<template>
  <div 
    class="status-wrap" 
    v-if="!isDemo"
  >
    <div class="status">
      <div 
        class="status-saving" 
        :class="{ 'show': isSaving }"
      >
        <span class="mobile-xs-hide">
          Saving
        </span>
        ...
      </div>
      <div 
        class="status-saved" 
        :class="{ 'show': !isSaving && saved }"
      >
        <span class="mobile-xs-hide">
          Saved
        </span>
        <span v-html="savedIcon" />
      </div>
      <div 
        class="status-error" 
        :class="{ 'show': !isSaving && saveError }"
        :title="saveErrorText" 
        v-tooltip="{ enabled: !isSaving && saveError }"
      >
        <span class="mobile-xs-hide">
          Error
        </span>
        <span v-html="errorIcon" />
      </div>
      <div 
        class="status-offline" 
        :class="{ 'show': !isSaving && offline }"
        :title="offlineText" 
        v-tooltip="{ enabled: !isSaving && offline }" 
        ref="offlineStatus"
      >
        <span class="mobile-xs-hide">
          Offline
        </span>
        <span v-html="offlineIcon" />
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api/api'
import Octicons from 'octicons'
import { Statuses, SET_STATUS_DONE, SET_STATUS_OFFLINE } from './status.store'
import tooltip from './tooltip.directive'

let offlineInterval

export default {
  created() {
    this.checkOffline()
    offlineInterval = setInterval(this.checkOffline, 15 * 1000)
  },
  beforeDestroy() {
    clearInterval(offlineInterval)
  },
  computed: {
    accountType() {
      return this.$store.state.user.user.accountType || {}
    },
    isDemo() {
      return this.accountType.name === 'DEMO'
    },
    offline() {
      return this.$store.state.status.status === Statuses.OFFLINE
    },
    saved() {
      return this.$store.state.status.status === Statuses.SAVED
    },
    saving() {
      return this.$store.state.status.status === Statuses.SAVING
    },
    saveError() {
      return this.$store.state.status.status === Statuses.ERROR
    },
  },
  data() {
    return {
      errorIcon: Octicons.alert.toSVG({
        height: 18,
        width: 18,
      }),
      isSaving: false,
      offlineIcon: Octicons.plug.toSVG({
        height: 18,
        width: 18,
      }),
      offlineText:
        'No internet connection is available. Your work is saved locally. ' +
        'To avoid losing work, don\'t edit this document on any other device until the connection is restored.',
      saveErrorText: 'An error has occurred. Your work may not be saved.',
      savedIcon: Octicons.check.toSVG({
        height: 18,
        width: 18,
      }),
      savingDebouncer: window.setTimeout(() => {}),
    }
  },
  directives: {
    tooltip,
  },
  methods: {
    checkOffline() {
      api.isOnline().then(() => {
        this.$store.commit(SET_STATUS_DONE)
      }, () => {
        this.$store.commit(SET_STATUS_OFFLINE)
      })
    }
  },
  watch: {
    offline(isOffline, wasOffline) {
      if (isOffline === wasOffline || !isOffline) {
        return
      }

      const el = this.$refs.offlineStatus
      if (!el._tippy) {
        console.warn('Expected a Tippy.js instance on statusSignal')
        return
      }

      setTimeout(() => {
        el._tippy.show()
      }, 1000)
    },
    // A bit of trickery to make the "Saving" indicator show for at least 500ms.
    // This comforts me.
    saving(saving) {
      if (saving) {
        this.isSaving = true
      }

      clearTimeout(this.savingDebouncer)
      this.savingDebouncer = window.setTimeout(() => {
        this.isSaving = this.saving
      }, 500)
    },
  },
}
</script>

<style scoped>
.status-wrap {
  align-items: center;
  display: flex;
  font-size: 22px;
  justify-content: center;
  margin: 0 16px;
}

.status {
  cursor: default;
  display: inline-block;
  height: 20px;
  position: relative;
  text-align: right;
  width: 95px;
}

@media (max-width: 1000px) {
  .status {
    width: 55px;
  }
}

@media (max-width: 650px) {
  .status {
    width: 16px;
  }
}

.status-saving {
  color: rgb(255, 165, 0);
  fill: rgb(255, 165, 0);
}

.status-saved {
  color: rgb(255, 255, 255);
  fill: rgb(255, 255, 255);
}

.status-error {
  color: rgb(255, 170, 0);
  fill: rgb(255, 170, 0);
}

.status-offline {
  color: rgb(255, 170, 0);
  fill: rgb(255, 170, 0);
}

.status-saving, .status-saved, .status-error, .status-offline {
  align-items: center;
  cursor: default;
  display: flex;
  flex-direction: row;
  opacity: 0;
  position: absolute;
  transition: opacity 500ms;
}

@media (max-width: 1000px) {
  .status-saving, .status-saved, .status-error, .status-offline {
    font-size: 14px;
  }
}

.status-saving.show, .status-saved.show, .status-error.show, .status-offline.show {
  opacity: 1;
}
</style>
