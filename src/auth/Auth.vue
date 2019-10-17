<template>
  <div 
    id="app" 
    class="app">
    <div 
      class="error" 
      v-if="incompatible">
      <p>
        This web browser does not support all the features of Edward.
        For the best experience, the latest version of <a href="https://www.google.com/chrome/">Google Chrome</a> is recommended.
      </p>
    </div>
    <div class="page">
      <div 
        class="logo" 
        @click="goToLogin()">
        <img src="../../public/img/modal-logo@2x.png">
      </div>
      <router-view/>
    </div>
    <div class="footer">
      <p class="footer-text">
        Edward the App © 2018 by <a 
          class="footer-link" 
          href="http://isaaclyman.com">Novelist LLC</a>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      incompatible: (
        typeof ''.includes !== 'function' ||
        !('serviceWorker' in navigator) ||
        !('storage' in navigator) ||
        typeof window.Promise !== 'function'
      ),
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/')
    },
  },
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
  border-radius: 6px;
  box-shadow: 0px 12px 40px 0px rgba(0,0,0,0.16);
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 100%;
  min-height: 400px;
  padding: 32px 64px 64px 64px;
  width: 700px;
}

.logo {
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 77px;
  justify-content: center;
  margin-bottom: 32px;
}

.logo img {
  height: 64px;
}

.footer {
  display: flex;
  justify-content: center;
  margin: 0;
}

.footer-text, .footer-link {
  color: #323232;
  font-size: 20px;
}

.footer-text {
  margin: 32px 2px;
}
</style>
