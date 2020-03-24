<template>
  <div 
    class="page-wrap" 
    @click.passive="resetIdleTime()"
    @mousemove.passive="resetIdleTime()"
    @scroll.passive="resetIdleTime()"
    @keypress.passive="resetIdleTime()"
  >
    <slot />
    <div 
      style="display: none"
    >
      <div
        class="idle-page"
        ref="idleModal"
      >
        <div class="idle-message">
          <h3>
            This page has been idle for over 30 minutes.
          </h3>
          <div>
            If you've edited your work on another computer, you should reload the page in order to get your latest content.
            Otherwise, you may lose your changes.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import swal from 'sweetalert'

export default {
  computed: {
    isPremium() {
      return this.user.isPremium
    },
    user() {
      return this.$store.state.user.user
    },
  },
  data() {
    return {
      idleTimeout: null
    }
  },
  methods: {
    backToApp() {
      this.resetIdleTime()
    },
    goIdle() {
      if (!this.isPremium) {
        return
      }

      this.showIdlePage()
    },
    reload() {
      window.location.reload()
    },
    resetIdleTime() {
      if (!this.isPremium) {
        return
      }

      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout)
      }

      // Go idle after 30 minutes
      const wait = 30 * 60 * 1000
      this.idleTimeout = window.setTimeout(this.goIdle, wait)
    },
    showIdlePage() {
      swal({
        content: this.$refs.idleModal,
        className: 'idle-modal',
        closeOnClickOutside: false,
        buttons: {
          cancel: 'Back to the app',
          confirm: {
            text: 'Reload',
            className: 'button-green'
          }
        },
      }).then(result => {
        if (!result) {
          this.resetIdleTime()
          return
        }

        this.reload()
      })
    },
  },
  mounted() {
    this.resetIdleTime()
  },
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

.idle-modal {
  background-color: #F2F9F8;
  padding: 32px;
}

.idle-page {
  display: flex;
  justify-content: center;
  width: 100%;
}

.idle-message {
  max-width: 800px;
  min-width: 300px;
}

.idle-message div {
  margin-top: 16px;
}
</style>
