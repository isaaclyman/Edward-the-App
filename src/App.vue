<template>
  <div id="app">
    <div class="app-header">
      <div class="app-header--content">
        <img class="app-header--logo" src="../static/logo.svg">
      </div>
    </div>
    <div class="app-header--after"></div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html, body {
  background-color: #FAFAFA;
  margin: 0;
  padding: 0;
  width: 100%;
}

.app-header {
  background-color: #FFF;
  box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.11);
  height: 45px;
  padding-bottom: 6px;
  padding-top: 10px;
  width: 100%;
}

.app-header--after {
  background: linear-gradient(to bottom, #FFF 10%, rgba(255,255,255,0) 90%);
  display: block;
  height: 8px;
  width: 100%;
}

.app-header--content {
  align-items: center;
  color: #FFF;
  display: flex;
  flex: 1;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 22px;
  height: 100%;
  justify-content: center;
}

.app-header--logo {
  height: 28px;
}

</style>
