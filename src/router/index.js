import Vue from 'vue'
import Router from 'vue-router'

import Composer from '../components/composer/composer.page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/compose'
    },
    {
      path: '/compose',
      name: 'Compose',
      component: Composer
    }
  ]
})
