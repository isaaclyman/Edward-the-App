import Vue from 'vue'
import Router from 'vue-router'
import authApi from './authApi'

Vue.use(Router)

import Account from './account.page.vue'
import DeleteAccount from './deleteAccount.page.vue'
import Forgot from './forgot.page.vue'
import Limited from './limited.page.vue'
import Login from './login.page.vue'
import Reset from './reset.page.vue'
import Signup from './signup.page.vue'
import Success from './success.page.vue'
import Verification from './verification.page.vue'
import Verify from './verify.page.vue'

let currentUser = null
const getCurrentUser = () => currentUser

const assertVerified = (to, from, next) => {
  authApi.getUser().then(user => {
    currentUser = user
    if (user.verified === false) {
      return next({ path: '/verification' })
    }
    next()
  }, err => {
    console.error(err)
    next({ path: '/login' })
  })
}

const assertUnverified = (to, from, next) => {
  authApi.getUser().then(user => {
    currentUser = user
    if (user.verified === true) {
      return next({ path: '/account' })
    }
    next()
  }, err => {
    console.error(err)
    next({ path: '/login' })
  })
}

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
      path: '/account',
      name: 'Account',
      component: Account,
      beforeEnter: assertVerified,
      meta: { getCurrentUser }
    },
    {
      path: '/delete-account',
      name: 'Delete Your Account',
      component: DeleteAccount
    },
    {
      path: '/forgot',
      name: 'Forgot Password',
      component: Forgot
    },
    {
      path: '/limited',
      name: 'Limited Account',
      component: Limited,
      beforeEnter: assertVerified,
      meta: { getCurrentUser }
    },
    {
      path: '/reset/:email/:key',
      name: 'Reset Password',
      component: Reset
    },
    {
      path: '/signup',
      name: 'Sign Up',
      component: Signup
    },
    {
      path: '/success',
      name: 'Success',
      component: Success,
      beforeEnter: assertVerified
    },
    {
      path: '/verification',
      name: 'Verify Account',
      component: Verification,
      beforeEnter: assertUnverified,
      meta: { getCurrentUser }
    },
    {
      path: '/verify/:email/:key',
      name: 'Verify Link',
      component: Verify
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
