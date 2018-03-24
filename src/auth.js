import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

Raven
    .config('https://1deaeecd96244297ad475854be0d5502@sentry.io/540818')
    .addPlugin(RavenVue, Vue)
    .install()

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
