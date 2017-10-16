<template>
  <div id="app" class="app">
    <div class="page">
      <div class="logo">
        <img src="../../static/logo.png">
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style scoped>
.app {
  padding-top: 20px;
}

.page {
  background-color: #FFF;
  border: 1px solid #CCC;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  min-height: 400px;
  width: 700px;
}

.logo {
  align-items: center;
  display: flex;
  height: 56px;
  justify-content: center;
  margin-top: 20px;
}
</style>
