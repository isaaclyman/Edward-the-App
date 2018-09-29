import Vue from 'vue'
import router from './admin/router'
import Admin from './admin/Admin.vue'

import './main.css'
import './admin/admin.css'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Admin },
  router,
  render(h) {
    return h('Admin')
  },
})
