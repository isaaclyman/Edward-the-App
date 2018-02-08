<template>
  <div class="page-wrap" :class="{ 'fade': fadeOn }" v-if="!needsReload"
    @click="resetIdleTime()"
    @mousemove="resetIdleTime()"
    @scroll="resetIdleTime()"
    @keypress="resetIdleTime()">
    <slot></slot>
  </div>
  <div class="page-wrap" v-else>
    <div class="idle-page">
      <div class="idle-message">
        <h4>
          The page has been idle for over 30 minutes.
        </h4>
        <div>
          If you've edited your work on another computer, you should reload the page in order to get your latest content.
          Otherwise, you may lose your changes.
        </div>
        <div class="actions">
          <button class="button-green reload-button" @click="reload()">Reload</button>
          <button class="button-red cancel-button" @click="backToApp()">Back to the app</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isPremium () {
      return this.user.isPremium
    },
    user () {
      return this.$store.state.user.user
    }
  },
  data () {
    return {
      fadeOn: false,
      fadeTimeout: null,
      idleTimeout: null,
      needsReload: false
    }
  },
  methods: {
    backToApp () {
      this.needsReload = false
      this.fadeOn = false
      this.resetIdleTime()
    },
    goIdle () {
      if (!this.isPremium) {
        return
      }

      // Fade for 3 seconds
      this.fadeTimeout = window.setTimeout(this.showIdlePage, 3 * 1000)
      this.fadeOn = true
    },
    reload () {
      window.location.reload()
    },
    resetIdleTime () {
      if (!this.isPremium) {
        return
      }

      this.fadeOn = false

      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout)
      }

      if (this.fadeTimeout) {
        window.clearTimeout(this.fadeTimeout)
      }

      // Go idle after 30 minutes
      const wait = 30 * 60 * 1000
      this.idleTimeout = window.setTimeout(this.goIdle, wait)
    },
    showIdlePage () {
      this.needsReload = true
    }
  },
  mounted () {
    this.resetIdleTime()
  }
}
</script>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  opacity: 1;
  transition: opacity 2s;
}

.page-wrap.fade {
  opacity: 0.1;
}

.idle-page {
  display: flex;
  justify-content: center;
  width: 100%;
}

.idle-message {
  margin-top: 60px;
  max-width: 800px;
  min-width: 300px;
}

.idle-message div {
  margin-top: 16px;
}
</style>
