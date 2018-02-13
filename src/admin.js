import Vue from 'vue'
import Admin from './admin/Admin.vue'

Vue.config.productionTip = false

import './main.css'
import './admin/admin.css'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Admin },
  template: '<Admin/>'
})
