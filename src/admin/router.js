import Vue from 'vue'
import Router from 'vue-router'

import Overview from './overview.page.vue'
import SendEmail from './sendEmail.page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/overview',
    },
    {
      path: '/overview',
      name: 'Overview',
      component: Overview,
    },
    {
      path: '/send-email/:id',
      name: 'Send Email',
      component: SendEmail,
    },
  ],
})
