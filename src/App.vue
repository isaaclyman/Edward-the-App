<template>
  <div id="app">
    <div class="app-header">
      <div class="app-header--content">sidebar</div>
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
  background-color: #9fa8da;
  height: 45px;
  padding-top: 6px;
  width: 100%;
}

.app-header--after {
  background: linear-gradient(to bottom, #9fa8da 10%, rgba(255,255,255,0) 90%);
  display: block;
  height: 18px;
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

</style>
