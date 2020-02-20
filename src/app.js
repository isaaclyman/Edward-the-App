// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

import router from './app/router'
import App from './app/App.vue'

import './assets/yui-cssreset.css'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'

import './app.css'
import store from './store'

if (window && window.isProd === true) {
  Raven
    .config('https://1deaeecd96244297ad475854be0d5502@sentry.io/540818')
    .addPlugin(RavenVue, Vue)
    .install()

  window.Raven = Raven
}

Vue.config.productionTip = false

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('SW registered: ', registration)
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  components: { App },
  router,
  store,
  render(h) {
    return h('App')
  },
})
