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
  </div>
</template>

<script>
import Octicons from 'octicons'
import tooltip from './tooltip.directive'

export default {
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
}

.main-menu--button {
  background-color: transparent;
  border: none;
  color: #777;
  height: 100%;
  margin-bottom: 2px;
  margin-top: 2px;
  padding: 6px 20px;
  transition: color 200ms ease-in-out;
}

.main-menu--button:hover {
  color: #000;
}

hr.vert:last-of-type {
  display: none;
}
</style>

<style>
.main-menu--icon {
  fill: #777;
  transition: fill 200ms ease-in-out;
}

.main-menu--button:hover .main-menu--icon {
  fill: #000;
}
</style>