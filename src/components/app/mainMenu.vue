<template>
  <div class="main-menu">
    <template v-for="route in routes">
      <router-link :to="route.location" :key="route.name">
        <button class="main-menu--button" :title="route.tooltip" v-tooltip>
          <div v-html="getIconSvg(route.icon)"></div>
          <div>{{route.name}}</div>
        </button>
      </router-link>
      <hr class="vert" :key="route.name"></hr>
    </template>
    <div class="spacer"></div>
    <div class="account">
      <div class="email">
        {{ email }}
      </div>
      <div class="account-type" :title="accountType.description" v-tooltip>
        {{ accountType.displayName }}
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
    email () {
      return this.$store.state.user.user.email || ''
    }
  },
  data () {
    return {
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
      }]
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

hr.vert:last-of-type {
  display: none;
}

.spacer {
  flex: 1;
}

.email {
  color: #005cb2;
  cursor: default;
  font-size: 14px;
  margin-right: 20px;
}

.account-type {
  color: #005cb2;
  cursor: default;
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