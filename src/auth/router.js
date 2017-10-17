import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Limited from './limited.page.vue'
import Login from './login.page.vue'
import Premium from './premium.page.vue'
import Signup from './signup.page.vue'

const assertSignedIn = () => {
  // Figure out if the user is signed in
  return true
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/limited',
      name: 'Limited Account',
      component: Limited,
      beforeEnter: (to, from, next) => {
        assertSignedIn() ? next() : next({ path: '/login' })
      }
    },
    {
      path: '/login',
      name: 'Log In',
      component: Login
    },
    {
      path: '/premium',
      name: 'Premium Account',
      component: Premium,
      beforeEnter: (to, from, next) => {
        assertSignedIn() ? next() : next({ path: '/login' })
      }
    },
    {
      path: '/signup',
      name: 'Sign Up',
      component: Signup
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
