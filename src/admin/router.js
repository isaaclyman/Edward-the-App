import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Overview from './overview.page.vue'
import SendEmail from './sendEmail.page.vue'

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/overview'
    },
    {
      path: '/overview',
      name: 'Overview',
      component: Overview
    },
    {
      path: '/send-email/:id',
      name: 'Send Email',
      component: SendEmail
    }
  ]
})
