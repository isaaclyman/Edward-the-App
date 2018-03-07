<template>
  <div class="main-menu">
    <template v-for="route in routes">
      <router-link :to="route.location" :key="route.name">
        <button class="main-menu--button" :title="route.tooltip" v-tooltip>
          <div v-html="getIconSvg(route.icon)"></div>
          <div>{{route.name}}</div>
        </button>
      </router-link>
      <hr class="vert between" :key="route.name">
    </template>
    <button class="main-menu--button" :title="toolsTooltip" v-tooltip>
      <div v-html="getIconSvg('tools')"></div>
      <div>Workshop</div>
    </button>
    <div class="spacer"></div>
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
    <hr class="vert">
    <a class="disguised" href="/auth#/account">
      <div class="account" :title="accountType.description" v-tooltip>
        <div class="email">
          {{ email }}
        </div>
        <div class="account-type">
          {{ accountType.displayName }}
        </div>
      </div>
    </a>
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
    email () {
      return this.$store.state.user.user.email || ''
    },
    isDemo () {
      return this.accountType.name === 'DEMO'
    },
    saveError () {
      return this.$store.state.status.error
    },
    saving () {
      return this.$store.state.status.saving
    }
  },
  data () {
    return {
      errorIcon: Octicons.alert.toSVG({
        height: 15,
        width: 15
      }),
      isSaving: false,
      routes: [{
        icon: 'telescope',
        location: '/plan',
        name: 'Plan',
        tooltip: 'Make general notes about characters, topics, settings, and more.'
      }, {
        icon: 'list-unordered',
        location: '/outline',
        name: 'Outline',
        tooltip: 'Create and organize chapters and chapter-specific notes.'
      }, {
        icon: 'pencil',
        location: '/write',
        name: 'Write',
        tooltip: 'Write, search and measure your content.'
      }, {
        icon: 'pulse',
        location: '/analyze',
        name: 'Analyze',
        tooltip: 'Get data-driven insights into your writing.'
      }],
      savedIcon: Octicons.check.toSVG({
        height: 15,
        width: 15
      }),
      saveErrorText: `Your work may not be saved. Please check your Internet connection.`,
      savingDebouncer: setTimeout(() => {}),
      toolsTooltip: 'Workshop your novel with free or prompted writing exercises.'
    }
  },
  directives: {
    tooltip
  },
  methods: {
    getIconSvg (iconName) {
      return Octicons[iconName].toSVG({
        class: 'main-menu--icon',
        height: 25,
        width: 25
      })
    }
  },
  watch: {
    // A bit of trickery to make the "Saving" indicator show for at least 500ms.
    // This comforts me.
    saving (saving) {
      if (saving) {
        this.isSaving = true
      }

      clearTimeout(this.savingDebouncer)
      this.savingDebouncer = setTimeout(() => {
        this.isSaving = this.saving
      }, 500)
    }
  }
}
</script>

<style scoped>
.main-menu {
  align-items: center;
  display: flex;
  flex: 1;
}

.main-menu--button {
  background-color: transparent;
  border: none;
  color: #777;
  height: 100%;
  margin-bottom: 2px;
  margin-top: 2px;
  padding: 6px 20px;
  transition: color 100ms ease-in-out;
}

.main-menu--button:hover {
  color: #000;
}

.router-link-active > .main-menu--button {
  color: #000;
}

hr.between:last-of-type {
  display: none;
}

.spacer {
  flex: 1;
}

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
  color: green;
  fill: green;
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

.account {
  color: inherit;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: none;
}

.email {
  color: #005cb2;
  font-size: 14px;
  margin-right: 20px;
}

.account-type {
  color: #005cb2;
  font-size: 14px;
  margin-right: 20px;
}
</style>

<style>
.main-menu--icon {
  fill: #777;
  transition: fill 100ms ease-in-out;
}

.main-menu--button:hover .main-menu--icon {
  fill: #000;
}

.router-link-active > .main-menu--button .main-menu--icon {
  fill: #000;
}
</style>