<template>
  <div class="main-menu">
    <button class="main-menu--button" v-for="route in routes" :key="route.name" @click="goToRoute(route.location)">
      <div v-html="getIconSvg(route.icon)"></div>
      <div>{{route.name}}</div>
    </button>
  </div>
</template>

<script>
import Octicons from 'octicons'

export default {
  data () {
    return {
      routes: [{
        icon: 'list-unordered',
        name: 'Outline',
        location: '/outline'
      }, {
        icon: 'pencil',
        name: 'Write',
        location: '/write'
      }, {
        icon: 'pulse',
        name: 'Analyze',
        location: '/analyze'
      }]
    }
  },
  methods: {
    getIconSvg (iconName) {
      return Octicons[iconName].toSVG({
        class: 'main-menu--icon',
        height: 25,
        width: 25
      })
    },
    goToRoute (location) {
      this.$router.push(location)
    }
  }
}
</script>

<style scoped>
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

.main-menu--button:not(:last-of-type) {
  border-right: 1px solid #CCC;
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