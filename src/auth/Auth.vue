<template>
  <div id="app" class="app">
    <div class="error" v-if="incompatible">
      <p>
        This web browser does not support all the features of Edward.
        For the best experience, the latest version of <a href="https://www.google.com/chrome/">Google Chrome</a> is recommended.
      </p>
    </div>
    <div class="page">
      <div class="logo" @click="goToLogin()">
        <img src="../../static/logo.png">
      </div>
      <router-view></router-view>
    </div>
    <div class="footer">
      <p class="footer-text">
        Edward the App © 2018 by <a class="footer-link" href="http://isaaclyman.com">Novelist LLC</a>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      incompatible: (typeof ''.includes !== 'function' || !('serviceWorker' in navigator))
    }
  },
  methods: {
    goToLogin () {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.app {
  padding-top: 20px;
}

.error {
  color: red;
  font-size: 16px;
  margin: 0 auto;
  max-width: 100%;
  width: 700px;
}

.page {
  background-color: #FFF;
  border: 1px solid #CCC;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 100%;
  min-height: 400px;
  width: 700px;
}

.logo {
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 77px;
  justify-content: center;
  margin-top: 20px;
}

.footer {
  display: flex;
  justify-content: center;
  margin: 0;
}

.footer-text, .footer-link {
  color: #000;
  font-family: 'Libre Baskerville', serif;
  font-size: 10px;
}

.footer-text {
  margin: 2px;
}
</style>
