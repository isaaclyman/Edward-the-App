import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

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
    }
  ]
})
