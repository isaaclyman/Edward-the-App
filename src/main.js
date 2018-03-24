// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

Raven
    .config('https://1deaeecd96244297ad475854be0d5502@sentry.io/540818')
    .addPlugin(RavenVue, Vue)
    .install()

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
