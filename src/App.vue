<template>
  <div id="app" class="app">
    <div class="app-header">
      <div class="app-header--content">
        <img class="app-header--logo" src="../static/logo.svg">
      </div>
      <div class="app-header--menu">
        <main-menu></main-menu>
      </div>
    </div>
    <div class="app-header--after"></div>
    <div class="page">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import MainMenu from './components/app/mainMenu.vue'

export default {
  components: {
    MainMenu
  },
  name: 'app'
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  background-color: #FFF;
  box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.11);
  display: flex;
  height: 60px;
  width: 100%;
}

.app-header--after {
  background: linear-gradient(to bottom, #FFF 10%, rgba(255,255,255,0) 90%);
  display: block;
  height: 8px;
  width: 100%;
}

.app-header--menu {
  display: flex;
  flex: 1;
  height: 100%;
}

.app-header--content {
  align-items: center;
  color: #FFF;
  display: flex;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 22px;
  height: 100%;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
}

.app-header--logo {
  height: 28px;
}

.page {
  display: flex;
  flex: 1;
  padding: 14px 25px;
}
</style>
