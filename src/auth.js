import Vue from 'vue'
import router from './auth/router'
import Auth from './auth/Auth.vue'

Vue.config.productionTip = false

import 'tippy.js/dist/tippy.css'

import './main.css'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Auth },
  router,
  template: '<Auth/>'
})
