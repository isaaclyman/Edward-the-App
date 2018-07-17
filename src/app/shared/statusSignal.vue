<template>
  <div class="status-wrap" v-if="!isDemo">
    <div class="status">
      <div class="status-saving" :class="{ 'show': isSaving }">
        Saving...
      </div>
      <div class="status-saved" :class="{ 'show': !isSaving && !saveError }">
        Saved <span v-html="savedIcon"></span>
      </div>
      <div class="status-error" :class="{ 'show': !isSaving && saveError }" v-show="saveError"
            :title="saveErrorText" v-tooltip>
        Error <span v-html="errorIcon"></span>
      </div>
    </div>
  </div>
</template>

<script>
import Octicons from 'octicons'
import tooltip from './tooltip.directive'

export default {
  computed: {
    accountType () {
      return this.$store.state.user.user.accountType || {}
    },
    isDemo () {
      return this.accountType.name === 'DEMO'
    },
    saving () {
      return this.$store.state.status.saving
    },
    saveError () {
      return this.$store.state.status.error
    }
  },
  data () {
    return {
      errorIcon: Octicons.alert.toSVG({
        height: 15,
        width: 15
      }),
      isSaving: false,
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
  color: orange;
  fill: orange;
}

.status-saved {
  color: rgb(1,171,109);
  fill: rgb(1,171,109);
}

.status-error {
  color: red;
  fill: red;
}

.status-saving, .status-saved, .status-error {
  cursor: default;
  opacity: 0;
  position: absolute;
  transition: opacity 500ms;
}

.status-saving.show, .status-saved.show, .status-error.show {
  opacity: 1;
}
</style>
