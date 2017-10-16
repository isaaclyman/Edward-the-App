import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Limited from './limited.page.vue'
import Login from './login.page.vue'

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Log In',
      component: Login
    },
    {
      path: '/limited',
      name: 'Limited Account',
      component: Limited
    }
  ]
})
