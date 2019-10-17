import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

import router from './auth/router'
import Auth from './auth/Auth.vue'

import 'tippy.js/dist/tippy.css'

import './main.css'
import './auth/auth.css'

Raven
  .config('https://1deaeecd96244297ad475854be0d5502@sentry.io/540818')
  .addPlugin(RavenVue, Vue)
  .install()

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Auth },
  router,
  render(h) {
    return h('Auth')
  },
})
