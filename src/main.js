// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './app/router'
import App from './app/App.vue'

Vue.config.productionTip = false

import './assets/yui-cssreset.css'
import 'tippy.js/dist/tippy.css'

import './main.css'
import store from './store'

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  components: { App },
  router,
  store,
  template: '<App/>'
})
