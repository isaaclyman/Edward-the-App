import Vue from 'vue'
import Router from 'vue-router'

import Composer from '../components/composer/composer.page.vue'
import Outliner from '../components/outliner/outliner.page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/write'
    },
    {
      path: '/outline',
      name: 'Outline',
      component: Outliner
    },
    {
      path: '/write',
      name: 'Write',
      component: Composer
    }
  ]
})
